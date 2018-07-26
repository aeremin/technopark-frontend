import { Component, ViewChild } from '@angular/core';
import { MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';

import { DataService, Model, Node, ReservationException } from 'src/services/data.service';

@Component({
  selector: 'app-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.css'],
})
export class OverviewPageComponent {
  public dataSource = new MatTableDataSource<Model>([]);
  @ViewChild(MatSort) public sort: MatSort;
  public chosenNodes: any = {};

  private _paramsColumns: string[] = [];

  constructor(private _dataService: DataService,
              private _matSnackBar: MatSnackBar) { }

  public ngOnInit() {
    const nodeCode = 'march_engine';
    this._dataService.readAllModels()
      .then((models) => {
        this.dataSource.data = models.filter((model) => model.node_type_code == nodeCode);
        this.dataSource.data.forEach((model) => {
          model.nodes.sort((n1, n2) => - n1.az_level + n2.az_level);
          // Hack: add fake node to show 0/xxx in az_level column
          if (!model.nodes.length) {
            model.nodes.push({
              az_level: 0, date_created: '', name: '',
              model_id: model.id, id: -1, status_code: 'fake',
            });
          }
          const availableNodes = model.nodes.filter((node) => this.nodeAvailable(node));
          if (availableNodes.length)
            this.chosenNodes[model.id] = availableNodes[0].id.toString();
          else
            this.chosenNodes[model.id] = model.nodes[0].id.toString();

        });
      });
    this._dataService.paramsForNodeCode(nodeCode)
      .then((result) => this._paramsColumns = result.filter((c) => c != 'az_level'));
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (data: Model, columnId: string) => this.cellValue(data, columnId);
  }

  public humanReadableColumnName(columnCode: string): string {
    const columnCodeToName = new Map<string, string>([
      ['id', 'ID'],
      ['name', 'Название'],
      ['level', 'Уровень'],
      ['company', 'Компания'],
      ['node_type', 'Тип'],
    ]);
    return columnCodeToName.get(columnCode) || this._dataService.paramsCodeToHumanReadable(columnCode);
  }

  public getAllColumns() {
    return this.getCommonColumns().concat(['az_level']).concat(this.getParamColumns()).concat('reserve');
  }

  public getParamColumns() {
    return this._paramsColumns;
  }

  public getCommonColumns() {
    return ['company', 'name', 'level'];
  }

  public cellValue(model: Model, columnId: string): string | number {
    if (model.hasOwnProperty(columnId))
      return model[columnId];
    let p = model.params[columnId];
    if (typeof p == 'number')
      p = p.toFixed(0);
    return p;
  }

  public nodePickerEnabled(model: Model): boolean {
    return model.nodes.filter((node) => node.status_code != 'fake').length > 0;
  }

  public nodeAvailable(node: Node): boolean {
    return node.status_code ==  'free';
  }

  public reserveEnabled(model: Model): boolean {
    return model.nodes && model.nodes.filter((node) => this.nodeAvailable(node)).length > 0;
  }

  public async reserve(model: Model) {
    const nodeId = this.chosenNodes[model.id];
    console.log(`Reserving model with id ${model.id}, node id ${nodeId}`);
    try {
      await this._dataService.reserve(nodeId);
      this._matSnackBar.open(`Узел ${nodeId} модели ${model.name} успешно зарезервирован.`, '', { duration: 2000 });
      this.ngOnInit();
    } catch (err) {
      if (err instanceof ReservationException)
        this._matSnackBar.open(`Ошибка: ${err.error}.`, '', { duration: 3000 });
      else
        this._matSnackBar.open(`Невозможно подключиться к серверу: ${err}.`, '', { duration: 3000 });
      console.log(err);
    }
  }
}
