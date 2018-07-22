import { Component, ViewChild } from '@angular/core';
import {MatSort, MatTableDataSource} from '@angular/material';

import { DataService } from 'src/services/data.service';

@Component({
  selector: 'app-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.css'],
})
export class OverviewPageComponent {
  public displayedColumns = ['id', 'name', 'level', 'company', 'type'];
  public dataSource = new MatTableDataSource([]);

  @ViewChild(MatSort) public sort: MatSort;

  constructor(private _dataService: DataService) { }

  public ngOnInit() {
    this.dataSource.sort = this.sort;
    this._dataService.readAll().then((m) => this.dataSource.data = m);
  }
}
