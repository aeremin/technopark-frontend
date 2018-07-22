import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

function url(path: string): string {
  return 'https://technopark.alice.magellan2018.ru' + path;
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
}

@Injectable()
export class DataService {
  constructor(private _http: Http) {}

  public async readAll(): Promise<Model[]> {
    const response = await this._http.post(url('/model/read_all'), {}).toPromise();
    const models: Model[] = response.json();
    return models.map((m) => this.makeHumanReadable(m));
  }

  private makeHumanReadable(model: Model): Model {
    const nodeCodeToHumanReadableType = new Map<string, string>([
      ['fuel_tank', 'Топливный бак'],
      ['hull', 'Корпус'],
      ['lss', 'Система жизнеобеспечения'],
      ['march_engine', 'Маршевый двигатель'],
      ['radar', 'Радар'],
      ['shields', 'Щиты'],
      ['shunter', 'Маневровые двигатели'],
      ['warp_engine', 'Двигатель Уайта'],
    ]);

    const companyCodeToHumanReadableName = new Map<string, string>([
      ['gd', 'Гугл Дисней'],
      ['mat', 'Мицубиси АвтоВАЗ Технолоджи'],
      ['mst', 'МарсСтройТрест'],
      ['pre', 'Пони Роскосмос Экспресс'],
      ['kkg', 'Красный Крест Генетикс'],
    ]);

    model.company = companyCodeToHumanReadableName.get(model.company);
    model.node_type = nodeCodeToHumanReadableType.get(model.node_type_code);
    return model;
  }
}
