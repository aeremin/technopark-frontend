import { Component, ViewChild } from '@angular/core';
import {MatSort, MatTableDataSource} from '@angular/material';

import { DataService, Model } from 'src/services/data.service';

@Component({
  selector: 'app-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.css'],
})
export class OverviewPageComponent {
  public displayedColumns = ['id', 'name', 'level', 'company'];
  public dataSource = new MatTableDataSource([]);

  @ViewChild(MatSort) public sort: MatSort;

  constructor(private _dataService: DataService) { }

  public ngOnInit() {
    const nodeCode = 'march_engine';
    this._dataService.readAllModels()
      .then((models) => this.dataSource.data = models.filter((model) => model.node_type_code == nodeCode));
    this._dataService.paramsForNodeCode(nodeCode)
      .then((result) => this.displayedColumns = ['id', 'name', 'level', 'company'].concat(result));
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

  public cellValue(model: Model, columnId: string): string | number {
    if (model.hasOwnProperty(columnId))
      return model[columnId];
    let p = model.params[columnId];
    if (typeof p == 'number')
      p = p.toFixed(2);
    return p;
  }
}
