import { Component, Input, ViewChild } from '@angular/core';
import { MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';

import { DataService, Model, Node, ReservationException } from 'src/services/data.service';

@Component({
  selector: 'reservation-table-component',
  templateUrl: './reservation-table.component.html',
  styleUrls: ['./reservation-table.component.css'],
})
export class ReservationTableComponent {
  @Input()
  public nodeCode: string;

  public dataSource = new MatTableDataSource<Model>([]);

  @ViewChild(MatSort) public sort: MatSort;
  public chosenNodes: any = {};

  private _paramsColumns: string[] = [];
  private _filterUnavailable: boolean = false;
  private _inputModels: Model[] = [];

  constructor(private _dataService: DataService,
              private _matSnackBar: MatSnackBar) { }

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
    return node.status_code == 'free';
  }

  public reserveEnabled(model: Model): boolean {
    return this._bestAvailableNode(model) != undefined;
  }

  public async reserve(model: Model) {
    const nodeId = this.chosenNodes[model.id];
    console.log(`Reserving model with id ${model.id}, node id ${nodeId}`);
    try {
      await this._dataService.reserve(nodeId);
      let reservedWord = 'зарезервирован';
      if (this.nodeCode == 'lss')
        reservedWord = reservedWord + 'а';
      if (this.nodeCode == 'shunter')
        reservedWord = reservedWord + 'ы';
      const nodeName = this._dataService.nodeCodeToHumanReadable().get(this.nodeCode);
      this._matSnackBar.open(
        `${nodeName} модели ${model.name} успешно ${reservedWord}.`, '', { duration: 2000 });
    } catch (err) {
      if (err instanceof ReservationException)
        this._matSnackBar.open(`Ошибка: ${err.error}.`, '', { duration: 3000 });
      else
        this._matSnackBar.open(`Невозможно подключиться к серверу: ${err}.`, '', { duration: 3000 });
      console.log(err);
    }
  }

  @Input() set filterUnavailable(filterUnavailable: boolean) {
    this._filterUnavailable = filterUnavailable;
    this._refresh();
  }

  @Input() set filter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  @Input() set models(models: Model[]) {
    this._inputModels = models;
    this._refresh();
  }

  private _refresh() {
    this.dataSource.data = this._inputModels.filter((model) => model.node_type_code == this.nodeCode);
    if (this._filterUnavailable) {
      this.dataSource.data = this.dataSource.data.filter((model) => this.reserveEnabled(model));
    }
    this.dataSource.data.forEach((model) => {
      if (this._filterUnavailable) {
        model.nodes = model.nodes.filter((node) => this.nodeAvailable(node));
      }
      model.nodes.sort((n1, n2) => - n1.az_level + n2.az_level);
      // Hack: add fake node to show 0/xxx in az_level column
      if (!model.nodes.length) {
        model.nodes.push({
          az_level: 0, date_created: '', name: '',
          model_id: model.id, id: -1, status_code: 'fake',
        });
      }
      this.chosenNodes[model.id] = (this._bestAvailableNode(model) || model.nodes[0]).id.toString();
    });
    this._paramsColumns = this._dataService.paramsForNodeCode(this.nodeCode).filter((c) => c != 'az_level');
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor =
      (model: Model, columnId: string) => {
        if (columnId == 'az_level') {
          const node = this._bestAvailableNode(model);
          return node ? node.az_level : 0;
        } else {
          return this.cellValue(model, columnId);
        }
      };
    this.dataSource.filterPredicate = ((model: Model, filter: string) => {
      const valuesToCheck = [model.company, model.name];
      for (const col of this.getParamColumns()) {
        valuesToCheck.push(model.params[col].toString());
      }
      return valuesToCheck.some((s) => s.toLocaleLowerCase().includes(filter));
    });
  }

  private _availableNodes(model: Model): Node[] {
    return model.nodes.filter((node) => this.nodeAvailable(node));
  }

  private _bestAvailableNode(model: Model): Node | undefined {
    const availableNodes = this._availableNodes(model);
    if (availableNodes.length)
      return availableNodes[0];
    else
      return undefined;
  }
}
