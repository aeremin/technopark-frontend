import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject, Observable } from 'rxjs';

export type NodeStatus = 'decomm' | 'free' | 'freight' | 'lost' | 'reserved'
  | 'fake' // "Ghost" node attached to model to show the model without any nodes
  | 'reserved_by_you' // Node which was reserved by current user
  ;

export interface Node {
  id: number;
  model_id: number;
  name: string;
  az_level: number;
  status_code: NodeStatus;
  date_created: string;
  is_premium: number;
}

export interface Model {
  id: number;
  name: string;
  node_type_code: string;
  node_type: string;
  level: number;
  size: string;
  description: string;
  company: string;
  company_name: string;
  created: string;
  params: any;
  nodes: Node[];
}

export interface FlightInfo {
  id: number;
  departure: string;
  dock: number;
  status: string; // TODO: enum
  company?: string;
}

export interface CrewEntry {
  role: 'supercargo' | 'pilot' | 'navigator' | 'radist' | 'engineer' | '_other';
  name: string;
  user_id: number;
}

export interface FullFlightInfo extends FlightInfo {
  crew: CrewEntry[];
  ship?: string;
}

interface MyReservedResponse {
  result: 'ok' | 'fail';
  flight: FlightInfo;
  nodes: any;
}

interface MyReservedResponse {
  result: 'ok' | 'fail';
  flight: FlightInfo;
  nodes: any;
}

export interface User {
  id: number;
  name: string;
}

export class BackendException {
  constructor(public error: string) { }
}

@Injectable()
export class DataService {
  private _nodeCodeToHumanReadable = new Map<string, string>();
  private _paramCodeToHumanReadable = new Map<string, string>();
  private _nodeCodeToParamCodes = new Map<string, string[]>();

  private _resourceCodeToHumanReadable = new Map<string, string>();

  private _readAllSubject: BehaviorSubject<Model[]>;

  private _flightsInfoSubject: BehaviorSubject<FullFlightInfo[]>;

  // TODO: Add login screen and pass user here.
  // tslint:disable-next-line:variable-name
  private userId = 4;

  constructor(private _http: Http) { }

  public async init(): Promise<void> {
    await Promise.all([
      this.queryParamNames(),
      this.queryResourceNames(),
    ]);
    const models = await this.readAllModels();
    this._readAllSubject = new BehaviorSubject(models);
    setInterval(() => this.reReadAllModels(), 60000);

    const flights = await this.getFlightsInfo();
    this._flightsInfoSubject = new BehaviorSubject(flights);
    setInterval(() => this.reGetFlightsInfo(), 60000);
  }

  public readAllModelsObservable(): Observable<Model[]> {
    return this._readAllSubject;
  }

  public getFlightsInfoObservable(): Observable<FullFlightInfo[]> {
    return this._flightsInfoSubject;
  }

  public async reserve(nodeId: number, password: string): Promise<void> {
    const response = await this._http.post(this.url('/node/reserve'),
      { node_id: nodeId, user_id: this.userId, password }).toPromise();
    const result: { status: string, errors?: string } = response.json();
    console.log(result);
    if (result.status != 'ok')
      throw new BackendException(result.errors);

    this.reReadAllModels();
  }

  public nodeCodeToHumanReadable(): Map<string, string> {
    return this._nodeCodeToHumanReadable;
  }

  public paramsForNodeCode(nodeCode: string): string[] {
    return this._nodeCodeToParamCodes.get(nodeCode) || [];
  }

  public paramsCodeToHumanReadable(nodeCode: string): string {
    return this._paramCodeToHumanReadable.get(nodeCode) || nodeCode;
  }

  public resourceCodeToHumanReadable(resourceCode: string): string {
    return this._resourceCodeToHumanReadable.get(resourceCode) || resourceCode;
  }

  public resouceCodes(): string[] {
    return Array.from(this._resourceCodeToHumanReadable.keys());
  }

  public async getActiveUsers(): Promise<User[]> {
    return (await this._http.get(this.url('/users/list')).toPromise()).json();
  }

  // tslint:disable-next-line:variable-name
  public async setAllCrew(flight_id: number,
                          crew: Array<{ role: string, user_id: number }>): Promise<void> {
    const response = await this._http.post(this.url('/mcc/set_all_crew'),
      { flight_id, crew }).toPromise();
    const result: { status: string, errors?: string, flight?: any } = response.json();
    if (result.status != 'ok')
      throw new BackendException(result.errors);
    await this.reGetFlightsInfo();
  }

  // Returns id of created flight
  // tslint:disable-next-line:variable-name
  public async createFlight(departure: string, dock: number, company: string): Promise<number> {
    const response = await this._http.post(this.url('/mcc/add_flight'),
      { departure, dock, company }).toPromise();
    const result: { status: string, errors?: string, flight?: any } = response.json();
    if (result.status != 'ok')
      throw new BackendException(result.errors);
    await this.reGetFlightsInfo();
    return result.flight.flight_id;
  }

  public async genericRequest(method: string): Promise<any[]> {
    const response = await this._http.get(this.url(method)).toPromise();
    return response.json();
  }

  private async queryParamNames(): Promise<void> {
    if (this._nodeCodeToHumanReadable.size > 0 && this._paramCodeToHumanReadable.size > 0)
      return;
    const response = await this._http.get(this.url('/get-params')).toPromise();
    interface ParamTranslationEntry {
      node_code: string;
      node_name: string;
      param_code: string;
      param_name: string;
      param_short_name: string;
    }
    const entries: ParamTranslationEntry[] = response.json();
    entries.forEach((e) => {
      this._nodeCodeToHumanReadable.set(e.node_code, e.node_name);
      this._paramCodeToHumanReadable.set(e.param_code, e.param_short_name);
      if (!this._nodeCodeToParamCodes.has(e.node_code))
        this._nodeCodeToParamCodes.set(e.node_code, []);
      if (!this._nodeCodeToParamCodes.get(e.node_code).includes(e.param_code))
        this._nodeCodeToParamCodes.get(e.node_code).push(e.param_code);
    });
  }

  private async queryResourceNames(): Promise<void> {
    const response = await this._http.get(this.url('/economics/resources')).toPromise();
    interface ResourceNamesEntry {
      code: string;
      name: string;
      is_active: string;
    }
    const entries: ResourceNamesEntry[] = response.json();
    entries.forEach((e) => {
      if (e.is_active) {
        this._resourceCodeToHumanReadable.set(e.code, e.name);
      }
    });
  }

  private makeHumanReadable(model: Model): Model {
    model.company_name = companyCodeToHumanReadableName.get(model.company);
    model.node_type = this._nodeCodeToHumanReadable.get(model.node_type_code);
    return model;
  }

  private url(path: string): string {
    return 'https://technopark-backend.alice.magellan2018.ru' + path;
  }

  private async reReadAllModels(): Promise<void> {
    this._readAllSubject.next(await this.readAllModels());
  }

  private async readAllModels(): Promise<Model[]> {
    const response = await this._http.post(this.url('/model/read_all'), {}).toPromise();
    const models: Model[] = response.json();

    const reserved = await this.getMyReserved();

    return models
      .map((m) => this.makeHumanReadable(m))
      .map((m) => {
        m.nodes = m.nodes.map((node) => {
          if (reserved.nodes[m.node_type_code] == node.id)
            node.status_code = 'reserved_by_you';
          return node;
        });
        return m;
      });
  }

  private async getMyReserved(): Promise<MyReservedResponse> {
    const response = await this._http.post(this.url('/node/get_my_reserved'), { user_id: this.userId }).toPromise();
    return response.json();
  }

  private async reGetFlightsInfo(): Promise<void> {
    this._flightsInfoSubject.next(await this.getFlightsInfo());
  }

  private async getFlightsInfo(): Promise<FullFlightInfo[]> {
    const response = await this._http.get(this.url('/mcc/dashboard')).toPromise();
    const flights: FullFlightInfo[] = [];
    for (const key in response.json()) {
      if (response.json().hasOwnProperty(key)) {
        flights.push(response.json()[key]);
      }
    }
    flights.sort((a, b) => a.departure < b.departure ? -1 : 1);
    return flights;
  }
}

export const companyCodeToHumanReadableName = new Map<string, string>([
  ['gd', 'Гугл Дисней'],
  ['mat', 'Мицубиси АвтоВАЗ Технолоджи'],
  ['mst', 'МарсСтройТрест'],
  ['pre', 'Пони Роскосмос Экспресс'],
  ['kkg', 'Красный Крест Генетикс'],
]);

export function companyCodes(): string[] {
  return Array.from(companyCodeToHumanReadableName.keys());
}
