import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

interface TechnologyChoice {
  index: number;
  technology: string;
  points: number;
  costs: any;
}

@Component({
  selector: 'app-invention-page',
  templateUrl: './invention-page.component.html',
  styleUrls: ['./invention-page.component.css'],
})
export class InventionPageComponent implements OnInit {

  public availableTechnologies = ['First', 'Second'];

  public dataSource = new MatTableDataSource<TechnologyChoice>([
    {index: 0, technology: 'None', points: 1, costs: {m1: 0, m2: 0}},
    {index: 1, technology: 'None', points: 1, costs: {m1: 0, m2: 0}},
    {index: 2, technology: 'None', points: 1, costs: {m1: 0, m2: 0}},
    {index: 3, technology: 'None', points: 1, costs: {m1: 0, m2: 0}},
  ]);

  constructor() { }

  public ngOnInit() {
  }

  public getAllColumns() {
    return ['technology', 'points'].concat(this.getCostsColumns());
  }

  public getCostsColumns() {
    return ['m1', 'm2'];
  }

  public humanReadableColumnName(columnCode: string) {
    return columnCode;
  }
}
