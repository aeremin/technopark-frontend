import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

interface TechnologyChoice {
  index: number;
  technology: string | undefined;
  points: number;
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
    {code: 'first', name: 'Первая', costs: {aluminium: 10, iron: 1} },
    {code: 'second', name: 'Вторая', costs: {aluminium: 5, iron: 3} },
  ];

  public dataSource = new MatTableDataSource<TechnologyChoice>([
    {index: 0, technology: undefined, points: 0},
    {index: 1, technology: undefined, points: 0},
    {index: 2, technology: undefined, points: 0},
    {index: 3, technology: undefined, points: 0},
  ]);

  constructor() { }

  public ngOnInit() {
  }

  public getAllColumns() {
    return ['technology', 'points'].concat(this.getCostsColumns());
  }

  public getCostsColumns() {
    return ['aluminium', 'iron'];
  }

  public humanReadableColumnName(columnCode: string) {
    return columnCode;
  }

  public technologySelected(value: string, technologyChoice: TechnologyChoice) {
    technologyChoice.technology = value;
  }

  public enableSlider(technologyChoice: TechnologyChoice): boolean {
    return technologyChoice.technology != undefined;
  }

  public getCost(technologyChoice: TechnologyChoice, col: string): number {
    if (!this.enableSlider(technologyChoice)) return 0;

    const technology = this.availableTechnologies.find((tech: Technology) => {
      return tech.code == technologyChoice.technology;
    });

    return technologyChoice.points * technology.costs[col];
  }

  public getTotalCost(col: string): number {
    return this.dataSource.data
      .map((technologyChoice) => this.getCost(technologyChoice, col))
      .reduce((a, b) => a + b);
  }
}
