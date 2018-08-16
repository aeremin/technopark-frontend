import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import * as moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Company, kCompanyCodeToHumanReadableName } from 'src/app/util';
import { AuthService } from 'src/services/auth.service';

export type NodeStatus = 'decomm' | 'free' | 'freight' | 'lost' | 'reserved'
  | 'fake' // "Ghost" node attached to model to show the model without any nodes
  | 'reserved_by_you' // Node which was reserved by current user
  ;

export interface Node {
  id: number;
  model_id: number;
  name: string;
  az_level: number;
  status: NodeStatus;
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
  company: Company;
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
  weight: number;
  volume: number;
}

export interface LuggageTypeInfo {
  code: LuggageCode;
  company?: Company;
  weight: number;
  volume: number;
}

export interface ModelsInfo {
  models: Model[];
  luggage: Luggage[];
}

export interface DevelopModelResponseParams {
  node_type_code: string;
  company: Company;
  size: string;
  tech_balls: any;
  description: string;
  password: string;
  name: string;
}

export interface DevelopModelResponse {
  status: string;
  params: DevelopModelResponseParams;
}

export class BackendException {
  constructor(public error: string) { }
}

export interface TableUrl {
  method: string;
  description: string;
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

  private _companyIncomeSubject = new BehaviorSubject<any>({});

  private _flightsInfoSubject: BehaviorSubject<FullFlightInfo[]>;

  constructor(private _authService: AuthService,
              private _http: Http) { }

  public async init(): Promise<void> {
    await Promise.all([
      this.queryParamNames(),
      this.queryResourceNames(),
    ]);
    const [models, flights, economicPumps, companyIncome] = 
      await Promise.all([
        this.readAllModels(),
        this.getFlightsInfo(),
        this.getEconomicPumps(),
        this.reGetCompanyIncome(),
      ]);

    this._readModelsInfoSubject = new BehaviorSubject(models);
    setInterval(() => this.reReadAllModels(), 60000);

    this._flightsInfoSubject = new BehaviorSubject(flights);
    setInterval(() => this.reGetFlightsInfo(), 60000);

    this._economicPumpsSubject = new BehaviorSubject(economicPumps);
    setInterval(() => this.reGetEconomicPumps(), 60000);

    this._companyIncomeSubject = new BehaviorSubject(companyIncome);
    setInterval(() => this.reGetCompanyIncome(), 60000);
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

  public companyIncomeObservable(): Observable<any> {
    return this._companyIncomeSubject;
  }

  public async reserve(nodeId: number, password: string): Promise<void> {
    await this._post('/node/reserve', { node_id: nodeId, user_id: this._authService.getAccount()._id, password });
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
    return await this._get('/users/list');
  }

  // tslint:disable-next-line:variable-name
  public async setAllCrew(flight_id: number,
                          crew: Array<{ role: string, user_id: number }>): Promise<void> {
    await this._post('/mcc/set_all_crew',  { flight_id, crew });
    await this.reGetFlightsInfo();
  }

  // tslint:disable-next-line:variable-name
  public async assignFlight(flight_id: number, company: string): Promise<void> {
    await this._post('/mcc/assign_flight', { flight_id, company });
  }

  // Returns id of created flight
  // tslint:disable-next-line:variable-name
  public async createFlight(departure: string, dock: number, company: string): Promise<number> {
    const result = await this._post('/mcc/add_flight', { departure, dock, company });
    await this.reGetFlightsInfo();
    return result.flight.flight_id;
  }

  public async genericRequest(method: string): Promise<any[]> {
    return await this._get(method);
  }

  // tslint:disable-next-line:variable-name
  public async createNode(model_id: number) {
    await this._post('/node/create', { model_id, password: '' });
    await this._updateModelsAndPumps();
  }

  // tslint:disable-next-line:variable-name
  public async deleteNode(node_id: number) {
    await this._post('/node/decomm', {
      node_id,
      reason: `Узел списан пользователем ${this._authService.getAccount().login}`,
    });
    await this._updateModelsAndPumps();
  }

  // tslint:disable-next-line:variable-name
  public async readTechs(node_type_code: string): Promise<Technology[]> {
    const company = this._authService.getCompany();
    if (company == undefined) return [];
    const result = await this._post('/tech/read', { node_type_code, company });

    const techs: Technology[] = [];
    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        techs.push(result[key]);
      }
    }
    return techs;
  }

  // tslint:disable-next-line:variable-name
  public async previewModelParams(node_type_code: string, size: string, tech_balls: any): Promise<any> {
    const company = this._authService.getCompany();
    return await this._post('/tech/preview_model_params',
      { node_type_code, company, size, tech_balls });
  }

  // tslint:disable-next-line:variable-name
  public async developModel(node_type_code: string, size: string, tech_balls: any, name: string,
                            description: string = '', password: string = ''): Promise<DevelopModelResponse> {
    const company = this._authService.getCompany();
    const result = await this._post('/tech/develop_model',
      { node_type_code, company, size, tech_balls, description, password, name });
    // Don't need to await - pump data on another screen anyway
    await this._updateModelsAndPumps();
    return result;
  }

  // tslint:disable-next-line:variable-name
  public async loadLuggage(flight_id: number, code: LuggageCode, company?: Company, planet_id?: string) {
    await this._post('/technopark/load_luggage', { flight_id, code, company, planet_id });
    await this.reReadAllModels();
  }

  // tslint:disable-next-line:variable-name
  public async unloadLuggage(flight_id: number, code: LuggageCode, company?: Company, planet_id?: string) {
    await this._post('/technopark/unload_luggage', { flight_id, code, company, planet_id });
    await this.reReadAllModels();
  }

  public async luggagesInfo(): Promise<LuggageTypeInfo[]> {
    return await this._get('/technopark/get_luggages_info');
  }

  // tslint:disable-next-line:variable-name
  public async freightShip(flight_id: number) {
    await this._post('/mcc/freight', { flight_id });
    await this.reReadAllModels();
  }

  public async tableUrls(): Promise<TableUrl[]> {
    const result = await this._get('/table_urls');
    const urls: TableUrl[] = [];
    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        urls.push({method: key, description: result[key]});
      }
    }
    return urls;
  }

  private async queryParamNames(): Promise<void> {
    if (this._nodeCodeToHumanReadable.size > 0 && this._paramCodeToHumanReadable.size > 0)
      return;
    interface ParamTranslationEntry {
      node_code: string;
      node_name: string;
      param_code: string;
      param_name: string;
      param_short_name: string;
    }
    const entries: ParamTranslationEntry[] = await this._get('/get-params');

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
    interface ResourceNamesEntry {
      code: string;
      name: string;
      is_active: string;
    }
    const entries: ResourceNamesEntry[] = await this._get('/economics/resources');
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

  private async _updateModelsAndPumps() {
    const [modelsInfo, pumps, income] = await Promise.all([
      this.readAllModels(),
      this.getEconomicPumps(),
      this.getCompanyIncome(),
    ]);

    this._readModelsInfoSubject.next(modelsInfo);
    this._economicPumpsSubject.next(pumps);
    this._companyIncomeSubject.next(income);
  }

  private async _get(path: string): Promise<any> {
    const response = await this._http.get(this._url(path)).toPromise();
    const result = response.json();
    if (result.status && result.status != 'ok')
      throw new BackendException(result.errors);
    return result;
  }

  private async _post(path: string, params: any): Promise<any> {
    const response = await this._http.post(this._url(path), params).toPromise();
    const result = response.json();
    if (result.status && result.status != 'ok')
      throw new BackendException(result.errors);
    return result;
  }

  private _url(path: string): string {
    return 'https://technopark-backend.alice.magellan2018.ru' + path;
  }

  private async reReadAllModels(): Promise<void> {
    this._readModelsInfoSubject.next(await this.readAllModels());
  }

  private async readAllModels(): Promise<ModelsInfo> {
    const [reserved, readAllresult] = await Promise.all([
      this.getMyReserved(),
      this._post('/model/read_all', {}) as Promise<Model[]>,
    ]);
    const models: Model[] = readAllresult.map((m) => this.makeHumanReadable(m))
      .map((m) => {
        m.nodes = m.nodes
          .filter((node) =>
            node.status == 'free' || node.status == 'reserved' || node.status == 'freight')
          .map((node) => {
            if (reserved && reserved.nodes && reserved.nodes[m.node_type_code] == node.id)
              node.status = 'reserved_by_you';
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
    let result: MyReservedResponse;
    try {
      result = await this._post('/node/get_my_reserved',
        { user_id: this._authService.getAccount()._id });
      this._isAssignedSupercargoSubject.next(result.flight.id);
    } catch (e) {
      this._isAssignedSupercargoSubject.next(undefined);
    }

    return result;
  }

  // tslint:disable-next-line:variable-name
  private async _getLuggage(flight_id: number): Promise<Luggage[]> {
    return await this._post('/technopark/get_luggage', { flight_id });
  }

  private async reGetFlightsInfo(): Promise<void> {
    this._flightsInfoSubject.next(await this.getFlightsInfo());
  }

  private async getFlightsInfo(): Promise<FullFlightInfo[]> {
    const result = await this._get('/mcc/dashboard');
    const flights: FullFlightInfo[] = [];
    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        flights.push(result[key]);
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

    const result = await this._post('/economics/read_pumps', {
      company: this._authService.getCompany(),
    });
    const pumps: EconomicPump[] = [];
    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        pumps.push(result[key]);
      }
    }
    return pumps;
  }

  private async reGetCompanyIncome(): Promise<void> {
    this._companyIncomeSubject.next(await this.getCompanyIncome());
  }

  private async getCompanyIncome(): Promise<any> {
    if (!this._authService.getCompany())
      return {};

    return await this._post('/economics/get_company_income', {
      company: this._authService.getCompany(),
    });
  }
}
