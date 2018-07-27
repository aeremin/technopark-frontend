import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject, Observable } from 'rxjs';

export type NodeStatus = 'decomm' | 'free' | 'freight' | 'lost' | 'reserved' | 'fake';

export interface Node {
  id: number;
  model_id: number;
  name: string;
  az_level: number;
  status_code: NodeStatus;
  date_created: string;
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
  created: string;
  params: any;
  nodes: Node[];
}

interface ParamTranslationEntry {
  node_code: string;
  node_name: string;
  param_code: string;
  param_name: string;
}

export class ReservationException {
  constructor(public error: string) {}
}

@Injectable()
export class DataService {
  private _nodeCodeToHumanReadable = new Map<string, string>();
  private _paramCodeToHumanReadable = new Map<string, string>();
  private _nodeCodeToParamCodes = new Map<string, string[]>();

  private _readAllSubject: BehaviorSubject<Model[]>;

  constructor(private _http: Http) {}

  public async init(): Promise<void> {
    await this.queryParamNames();
    const models = await this.readAllModels();
    this._readAllSubject = new BehaviorSubject(models);
  }

  public readAllModelsObservable(): Observable<Model[]> {
    return this._readAllSubject;
  }

  // tslint:disable-next-line:variable-name
  public async reserve(node_id: number): Promise<void> {
    // TODO: Add login screen and pass user here.
    // tslint:disable-next-line:variable-name
    const user_id = 4;
    const response = await this._http.post(this.url('/node/reserve'), {node_id, user_id, password: ''}).toPromise();
    const result: {status: string, errors?: string}  = response.json();
    console.log(result);
    if (result.status != 'ok')
      throw new ReservationException(result.errors);

    this._readAllSubject.next(await this.readAllModels());
  }

  public nodeCodeToHumanReadable(): Map<string, string> {
    return this._nodeCodeToHumanReadable;
  }

  public paramsForNodeCode(nodeCode: string): string[] {
    return this._nodeCodeToParamCodes.get(nodeCode);
  }

  public paramsCodeToHumanReadable(nodeCode: string): string {
    return this._paramCodeToHumanReadable.get(nodeCode) || nodeCode;
  }

  private async queryParamNames(): Promise<void> {
    if (this._nodeCodeToHumanReadable.size > 0 && this._paramCodeToHumanReadable.size > 0)
      return;

    const response = await this._http.get(this.url('/get-params'), {}).toPromise();
    const entries: ParamTranslationEntry[] = response.json();
    entries.forEach((e) => {
      this._nodeCodeToHumanReadable.set(e.node_code, e.node_name);
      this._paramCodeToHumanReadable.set(e.param_code, e.param_name);
      if (!this._nodeCodeToParamCodes.has(e.node_code))
        this._nodeCodeToParamCodes.set(e.node_code, []);
      if (!this._nodeCodeToParamCodes.get(e.node_code).includes(e.param_code))
        this._nodeCodeToParamCodes.get(e.node_code).push(e.param_code);
    });
  }

  private makeHumanReadable(model: Model): Model {
    const companyCodeToHumanReadableName = new Map<string, string>([
      ['gd', 'Гугл Дисней'],
      ['mat', 'Мицубиси АвтоВАЗ Технолоджи'],
      ['mst', 'МарсСтройТрест'],
      ['pre', 'Пони Роскосмос Экспресс'],
      ['kkg', 'Красный Крест Генетикс'],
    ]);

    model.company = companyCodeToHumanReadableName.get(model.company);
    model.node_type = this._nodeCodeToHumanReadable.get(model.node_type_code);
    return model;
  }

  private url(path: string): string {
    return 'https://technopark-backend.alice.magellan2018.ru' + path;
  }

  private async readAllModels(): Promise<Model[]> {
    const response = await this._http.post(this.url('/model/read_all'), {}).toPromise();
    const models: Model[] = response.json();
    return models.map((m) => this.makeHumanReadable(m));
  }
}
