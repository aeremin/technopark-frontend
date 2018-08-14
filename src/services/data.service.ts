import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { kCompanyCodeToHumanReadableName } from 'src/app/util';
import { AuthService, Company } from 'src/services/auth.service';

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
  status: string;
  company: string;
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

export interface User {
  id: number;
  name: string;
}

export interface EconomicPump {
  id: number;
  company: Company;
  date_begin: string;
  date_end?: string;
  section: string;
  entity_id?: string;
  comment: string;
  is_income: number;
  resources: any;
}

export interface Technology {
  id: number;
  name: string;
  description: string;
  opened_at: string;
  level: number;
  company: Company;
  effects: any[];
  inventors: Company[];
  point_cost: any;
}

export type LuggageCode = 'mine' | 'beacon' | 'module';

export interface Luggage {
  code: LuggageCode;
  company: Company;
  planet_id?: string;
  amount: number;
}

export interface ModelsInfo {
  models: Model[];
  luggage: Luggage[];
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

  private _readModelsInfoSubject: BehaviorSubject<ModelsInfo>;

  private _economicPumpsSubject: BehaviorSubject<EconomicPump[]>;

  private _isAssignedSupercargoSubject = new BehaviorSubject<number>(undefined);

  private _flightsInfoSubject: BehaviorSubject<FullFlightInfo[]>;

  constructor(private _authService: AuthService,
              private _http: Http) { }

  public async init(): Promise<void> {
    await Promise.all([
      this.queryParamNames(),
      this.queryResourceNames(),
    ]);
    const models = await this.readAllModels();
    this._readModelsInfoSubject = new BehaviorSubject(models);
    setInterval(() => this.reReadAllModels(), 60000);

    const flights = await this.getFlightsInfo();
    this._flightsInfoSubject = new BehaviorSubject(flights);
    setInterval(() => this.reGetFlightsInfo(), 60000);

    const economicPumps = await this.getEconomicPumps();
    this._economicPumpsSubject = new BehaviorSubject(economicPumps);
    setInterval(() => this.reGetEconomicPumps(), 60000);
  }

  public readModelsInfoObservable(): Observable<ModelsInfo> {
    return this._readModelsInfoSubject;
  }

  public isAssignedSupercargoObservable(): Observable<number> {
    return this._isAssignedSupercargoSubject;
  }

  public getFlightsInfoObservable(): Observable<FullFlightInfo[]> {
    return this._flightsInfoSubject;
  }

  public getEconomicPumpsObservable(): Observable<EconomicPump[]> {
    return this._economicPumpsSubject;
  }

  public async reserve(nodeId: number, password: string): Promise<void> {
    const response = await this._http.post(this.url('/node/reserve'),
      { node_id: nodeId, user_id: this._authService.getAccount()._id, password }).toPromise();
    const result: { status: string, errors?: string } = response.json();
    console.log(result);
    if (result.status != 'ok')
      throw new BackendException(result.errors);

    await this.reReadAllModels();
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

  // tslint:disable-next-line:variable-name
  public async assignFlight(flight_id: number, company: string): Promise<void> {
    await this._http.post(this.url('/mcc/assign_flight'), { flight_id, company }).toPromise();
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

  // tslint:disable-next-line:variable-name
  public async createNode(model_id: number) {
    await this._http.post(this.url('/node/create'), { model_id, password: '' }).toPromise();
    await this.reGetEconomicPumps();
    await this.reReadAllModels();
  }

  // tslint:disable-next-line:variable-name
  public async readTechs(node_type_code: string): Promise<Technology[]> {
    const company = this._authService.getCompany();
    if (company == undefined) return [];
    const response = await this._http.post(this.url('/tech/read'), { node_type_code, company }).toPromise();

    const techs: Technology[] = [];
    for (const key in response.json()) {
      if (response.json().hasOwnProperty(key)) {
        techs.push(response.json()[key]);
      }
    }
    return techs;
  }

  // tslint:disable-next-line:variable-name
  public async previewModelParams(node_type_code: string, size: string, tech_balls: any): Promise<any> {
    const company = this._authService.getCompany();
    const response = await this._http.post(
      this.url('/tech/preview_model_params'),
      { node_type_code, company, size, tech_balls }).toPromise();

    return response.json();
  }

  // tslint:disable-next-line:variable-name
  public async developModel(node_type_code: string, size: string, tech_balls: any, name: string,
                            description: string = '', password: string = '') {
    const company = this._authService.getCompany();
    const response = await this._http.post(
      this.url('/tech/develop_model'),
      { node_type_code, company, size, tech_balls, description, password, name }).toPromise();

    console.log(JSON.stringify(response.json()));
    return response.json();
  }

  // tslint:disable-next-line:variable-name
  public async loadLuggage(flight_id: number, code: LuggageCode) {
    const response = await this._http.post(
      this.url('/technopark/load_luggage'),
      { flight_id, code, company: 'mst', planet_id: 'aaa' }).toPromise();
    const result = response.json();
    if (result.status != 'ok')
      throw new BackendException(result.errors);
    await this.reReadAllModels();
  }

  // tslint:disable-next-line:variable-name
  public async unloadLuggage(flight_id: number, code: LuggageCode) {
    const response = await this._http.post(
      this.url('/technopark/unload_luggage'),
      { flight_id, code, company: 'mst', planet_id: 'aaa' }).toPromise();
    const result = response.json();
    if (result.status != 'ok')
      throw new BackendException(result.errors);
    await this.reReadAllModels();
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
    model.company_name = kCompanyCodeToHumanReadableName.get(model.company);
    model.node_type = this._nodeCodeToHumanReadable.get(model.node_type_code);
    return model;
  }

  private url(path: string): string {
    return 'https://technopark-backend.alice.magellan2018.ru' + path;
  }

  private async reReadAllModels(): Promise<void> {
    this._readModelsInfoSubject.next(await this.readAllModels());
  }

  private async readAllModels(): Promise<ModelsInfo> {
    const [reserved, readAllResponse] = await Promise.all([
      this.getMyReserved(),
      this._http.post(this.url('/model/read_all'), {}).toPromise(),
    ]);
    const models: Model[] = readAllResponse.json().map((m) => this.makeHumanReadable(m))
      .map((m) => {
        m.nodes = m.nodes.map((node) => {
          if (reserved && reserved.nodes && reserved.nodes[m.node_type_code] == node.id)
            node.status_code = 'reserved_by_you';
          return node;
        });
        return m;
      });

    const luggage = (reserved == undefined || reserved.flight == undefined)
      ? [] : await this._getLuggage(reserved.flight.id);
    return {models, luggage};
  }

  private async getMyReserved(): Promise<MyReservedResponse> {
    if (!this._authService.getAccount()) {
      this._isAssignedSupercargoSubject.next(undefined);
      return undefined;
    }
    const response = await this._http.post(this.url('/node/get_my_reserved'),
      { user_id: this._authService.getAccount()._id }).toPromise();

    const result: MyReservedResponse = response.json();
    this._isAssignedSupercargoSubject.next(result.result == 'ok' ? result.flight.id : undefined);

    return result;
  }

  // tslint:disable-next-line:variable-name
  private async _getLuggage(flight_id: number): Promise<Luggage[]> {
    const response = await this._http.post(this.url('/technopark/get_luggage'),
      { flight_id }).toPromise();
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

    const compareDatesFn = (a: string, b: string) => {
      const aParsed = moment(a, 'DD.MM.YYYY hh:mm');
      const bParsed = moment(b, 'DD.MM.YYYY hh:mm');
      if (aParsed < bParsed) return -1;
      if (aParsed > bParsed) return 1;
      return 0;
    };

    const compareDocksFn = (a: number, b: number) => {
      return a - b;
    };

    flights.sort((a, b) => compareDatesFn(a.departure, b.departure) || compareDocksFn(a.dock, b.dock));
    return flights;
  }

  private async reGetEconomicPumps(): Promise<void> {
    this._economicPumpsSubject.next(await this.getEconomicPumps());
  }

  private async getEconomicPumps(): Promise<EconomicPump[]> {
    if (!this._authService.getCompany())
      return [];

    const response = await this._http.post(this.url('/economics/read_pumps'), {
      company: this._authService.getCompany(),
    }).toPromise();
    const pumps: EconomicPump[] = [];
    for (const key in response.json()) {
      if (response.json().hasOwnProperty(key)) {
        pumps.push(response.json()[key]);
      }
    }
    return pumps;
  }
}
