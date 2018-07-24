import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

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
}

interface ParamTranslationEntry {
  node_code: string;
  node_name: string;
  param_code: string;
  param_name: string;
}

@Injectable()
export class DataService {
  private _nodeCodeToHumanReadable = new Map<string, string>();
  private _paramCodeToHumanReadable = new Map<string, string>();
  private _nodeCodeToParamCodes = new Map<string, string[]>();

  constructor(private _http: Http) {}

  public async readAllModels(): Promise<Model[]> {
    await this.queryParamNames();
    const response = await this._http.post(this.url('/model/read_all'), {}).toPromise();
    const models: Model[] = response.json();
    return models.map((m) => this.makeHumanReadable(m));
  }

  public paramsForNodeCode(nodeCode: string): string[] {
    return this._nodeCodeToParamCodes.get(nodeCode);
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
    return 'https://technopark.alice.magellan2018.ru' + path;
  }
}
