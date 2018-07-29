import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { DataService } from '../../services/data.service';

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

  public size: string = 'medium';

  constructor(private _dataService: DataService) { }

  public async ngOnInit() {
    await this._dataService.init();
  }

  public getAllColumns() {
    return ['technology', 'points'].concat(this.getCostsColumns());
  }

  public getCostsColumns() {
    return this._dataService.resouceCodes();
  }

  public humanReadableColumnName(columnCode: string) {
    return this._dataService.resourceCodeToHumanReadable(columnCode);
  }

  public technologySelected(value: string, technologyChoice: TechnologyChoice) {
    technologyChoice.technology = value;
    if (value == undefined) {
      technologyChoice.points = 0;
    }
  }

  public enableSlider(technologyChoice: TechnologyChoice): boolean {
    return technologyChoice.technology != undefined;
  }

  public getCost(technologyChoice: TechnologyChoice, col: string): number {
    if (!this.enableSlider(technologyChoice)) return 0;

    const technology = this.availableTechnologies.find((tech: Technology) => {
      return tech.code == technologyChoice.technology;
    });

    return technologyChoice.points * (technology.costs[col] || 0);
  }

  public getTotalCost(col: string): number {
    return this.dataSource.data
      .map((technologyChoice) => this.getCost(technologyChoice, col))
      .reduce((a, b) => a + b);
  }

  public isTechnologyEnabled(technologyChoice: TechnologyChoice, tech: Technology): boolean {
    return !this.dataSource.data
      .filter((otherChoice) => otherChoice.index != technologyChoice.index)
      .map((otherChoice) => otherChoice.technology)
      .includes(tech.code);
  }
}
