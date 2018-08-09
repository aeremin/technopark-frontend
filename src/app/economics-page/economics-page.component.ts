import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { DataService, EconomicPump } from 'src/services/data.service';

@Component({
  selector: 'app-economics-page',
  templateUrl: './economics-page.component.html',
  styleUrls: ['./economics-page.component.css'],
})
export class EconomicsPageComponent implements OnInit {

  public dataSource = new MatTableDataSource<EconomicPump>();

  constructor(private _dataService: DataService) { }

  public ngOnInit() {
    this._dataService.getEconomicPumpsObservable().subscribe({
      next: (pumps) => this.dataSource.data = pumps,
    });
  }

  public getAllColumns() {
    return ['section', 'comment'].concat(this.getCostsColumns());
  }

  public getCostsColumns() {
    return this._dataService.resouceCodes();
  }

  public humanReadableColumnName(columnCode: string) {
    return this._dataService.resourceCodeToHumanReadable(columnCode);
  }

  public getCost(pump: EconomicPump, col: string): number {
    return (pump.resources[col] || 0) * (pump.is_income ? 1 : -1);
  }

  public getTotalCost(col: string): number {
    return this.dataSource.data
      .map((pump) => this.getCost(pump, col))
      .reduce((a, b) => a + b, 0);
  }

}
