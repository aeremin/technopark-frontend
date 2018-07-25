import { Component, ViewChild } from '@angular/core';
import {MatSort, MatTableDataSource} from '@angular/material';

import { DataService, Model } from 'src/services/data.service';

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

  constructor(private _dataService: DataService) { }

  public ngOnInit() {
    const nodeCode = 'march_engine';
    this._dataService.readAllModels()
      .then((models) => {
        this.dataSource.data = models.filter((model) => model.node_type_code == nodeCode);
        this.dataSource.data.forEach((model) => {
          model.nodes.sort((n1, n2) => - n1.az_level + n2.az_level);
          if (model.nodes.length)
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

  public reserveEnabled(model: Model): boolean {
    return model.nodes && model.nodes.filter((node) => node.status_code == 'free').length > 0;
  }

  public reserve(model: Model) {
    console.log(`Reserving model with id ${model.id}, node id ${this.chosenNodes[model.id]}`);
  }
}
