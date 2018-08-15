import { Component, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource } from '@angular/material';
import { DataService, TableUrl } from '../../services/data.service';

@Component({
  selector: 'app-gamemaster-generic-table',
  templateUrl: './gamemaster-generic-table.component.html',
  styleUrls: ['./gamemaster-generic-table.component.css'],
})
export class GamemasterGenericTableComponent {
  public methods: TableUrl[] = [];

  public method: TableUrl;

  public dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatSort) public sort: MatSort;

  constructor(private _dataService: DataService) {}

  public async ngOnInit() {
    this.dataSource.sort = this.sort;
    this.methods = await this._dataService.tableUrls();
    this.method = this.methods[0];
    this.refresh();
  }

  public getKeys(): string[] {
    if (this.dataSource.data.length == 0)
      return [];
    const result: string[] = [];
    for (const key in this.dataSource.data[0])
      if (this.dataSource.data[0].hasOwnProperty(key))
        result.push(key);
    return result;
  }

  public async refresh() {
    this.dataSource.data = await this._dataService.genericRequest(this.method.method);
  }
}
