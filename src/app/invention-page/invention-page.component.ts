import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import { AuthService } from '../../services/auth.service';
import { DataService, Model, Technology, BackendException } from '../../services/data.service';

class TechnologyChoice {
  public points: number = 0;
  private _technology: number | undefined = undefined;

  constructor(public index: number) {}

  public set technology(tech: number | undefined) {
    this._technology = tech;
    if (tech == undefined)
      this.points = 0;
  }

  public get technology() {
    return this._technology;
  }
}

interface ModelChoice {
  nodeCode: string;
  nodeName: string;
}

@Component({
  selector: 'app-invention-page',
  templateUrl: './invention-page.component.html',
  styleUrls: ['./invention-page.component.css'],
})
export class InventionPageComponent implements OnInit {
  public modelTypeOptions: ModelChoice[];

  public availableTechnologies: Technology[];

  public dataSource = new MatTableDataSource<TechnologyChoice>([
    new TechnologyChoice(0),
    new TechnologyChoice(1),
    new TechnologyChoice(2),
    new TechnologyChoice(3),
  ]);

  public size: string = 'medium';
  public modelName: string;

  private _nodeCode: string = 'fuel_tank';
  private _resultingModelParams: any = {az_level: 0};

  constructor(private _dataService: DataService,
              private _authService: AuthService,
              private _matSnackBar: MatSnackBar) { }

  public set nodeCode(code: string) {
    this.dataSource.data.forEach((choice) => choice.technology = undefined);
    this._nodeCode = code;
    this._dataService.readTechs(this._nodeCode)
      .then((techs) => this.availableTechnologies = techs)
      .catch((e) => console.error(e));
  }

  public get nodeCode() {
    return this._nodeCode;
  }
  public async ngOnInit() {
    await this._dataService.init();
    this.modelTypeOptions = [];
    this._dataService.nodeCodeToHumanReadable().forEach(
      (nodeName, nodeCode) => this.modelTypeOptions.push({nodeCode, nodeName}));
  }

  public async refreshParams() {
    this._resultingModelParams =
      await this._dataService.previewModelParams(this.nodeCode, this.size, this._calculatePoints());
  }

  public getModels(): Model[] {
    return [{
      id: 0,
      company: this._authService.getCompany(),
      company_name: '',
      created: '',
      description: '',
      level: 0,
      name: this.modelName,
      node_type: '',
      node_type_code:
      this._nodeCode,
      nodes: [{
        az_level: this._resultingModelParams.az_level,
        date_created: '',
        id: 0,
        is_premium: 0,
        model_id: 0,
        name: '',
        status_code: 'free',
      }],
      params: this._resultingModelParams,
      size: this.size,
    }];
  }

  public getAllColumns() {
    return ['technology', 'points'].concat(this.getCostsColumns());
  }

  public getCostsColumns() {
    return this._dataService.resouceCodes();
  }

  public humanReadableColumnName(columnCode: string) {
    return this._dataService.resourceCodeToHumanReadable(columnCode);
  }

  public enableSlider(technologyChoice: TechnologyChoice): boolean {
    return technologyChoice.technology != undefined;
  }

  public getCost(technologyChoice: TechnologyChoice, col: string): number {
    if (!this.enableSlider(technologyChoice)) return 0;

    const technology = this.availableTechnologies.find((tech: Technology) => {
      return tech.id == technologyChoice.technology;
    });

    return technologyChoice.points * (technology.point_cost[col] || 0);
  }

  public getTotalCost(col: string): number {
    return this.dataSource.data
      .map((technologyChoice) => this.getCost(technologyChoice, col))
      .reduce((a, b) => a + b);
  }

  public isTechnologyEnabled(technologyChoice: TechnologyChoice, tech: Technology): boolean {
    return !this.dataSource.data
      .filter((otherChoice) => otherChoice.index != technologyChoice.index)
      .map((otherChoice) => otherChoice.technology)
      .includes(tech.id);
  }

  public readyToCreateModel(): boolean {
    return JSON.stringify(this._calculatePoints()) != '{}' &&
      this.modelName && this.modelName != '';
  }

  public async onDevelopModel() {
    try {
      const response = await this._dataService.developModel(this._nodeCode, this.size, this._calculatePoints(),
        this.modelName);

      this._matSnackBar.open(
        `Модель и ее первый узел созданы успешно. Пароль для фрахта: ${response.params.password}`,
        '', { duration: 10000 });
    } catch (err) {
      if (err instanceof BackendException)
        this._matSnackBar.open(`Ошибка: ${err.error}.`, '', { duration: 3000 });
      else
        this._matSnackBar.open(`Невозможно подключиться к серверу: ${err}.`, '', { duration: 3000 });
      console.log(err);
    }
  }

  private _calculatePoints() {
    const points: any = {};
    this.dataSource.data.forEach((techChoice) => {
      if (techChoice.technology != undefined && techChoice.points > 0) {
        points[techChoice.technology.toString()] = techChoice.points;
      }
    });
    return points;
  }
}
