import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

interface TechnologyChoice {
  index: number;
  technology: string | undefined;
  points: number;
  costs: any;
}

interface Technology {
  code: string;
  name: string;
  costs: any;
}

@Component({
  selector: 'app-invention-page',
  templateUrl: './invention-page.component.html',
  styleUrls: ['./invention-page.component.css'],
})
export class InventionPageComponent implements OnInit {

  public availableTechnologies: Technology[] = [
    {code: 'first', name: 'Первая', costs: {m1: 10, m2: 1} },
    {code: 'second', name: 'Вторая', costs: {m1: 5, m2: 3} },
  ];

  public dataSource = new MatTableDataSource<TechnologyChoice>([
    {index: 0, technology: undefined, points: 1, costs: {m1: 0, m2: 0}},
    {index: 1, technology: undefined, points: 1, costs: {m1: 0, m2: 0}},
    {index: 2, technology: undefined, points: 1, costs: {m1: 0, m2: 0}},
    {index: 3, technology: undefined, points: 1, costs: {m1: 0, m2: 0}},
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

  public technologySelected(value: string, technologyChoice: TechnologyChoice) {
    technologyChoice.technology = value;
    console.log(JSON.stringify(this.dataSource.data));
    console.log(JSON.stringify(technologyChoice));
  }

  public enableSlider(technologyChoice: TechnologyChoice): boolean {
    return technologyChoice.technology != undefined;
  }
}
