import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { DataService, Model, Technology } from '../../services/data.service';

class TechnologyChoice {
  public points: number = 0;
  private _technology: number | undefined = undefined;

  constructor(public index: number) {}

  public set technology(tech: number | undefined) {
    this._technology = tech;
    if (tech == undefined)
      this.points = 0;
  }

  public get technology() {
    return this._technology;
  }
}

interface ModelChoice {
  nodeCode: string;
  nodeName: string;
}

@Component({
  selector: 'app-invention-page',
  templateUrl: './invention-page.component.html',
  styleUrls: ['./invention-page.component.css'],
})
export class InventionPageComponent implements OnInit {
  public modelTypeOptions: ModelChoice[];

  public availableTechnologies: Technology[];

  public dataSource = new MatTableDataSource<TechnologyChoice>([
    new TechnologyChoice(0),
    new TechnologyChoice(1),
    new TechnologyChoice(2),
    new TechnologyChoice(3),
  ]);

  public size: string = 'medium';
  public modelName: string;

  private _nodeCode: string = 'fuel_tank';

  constructor(private _dataService: DataService) { }

  public set nodeCode(code: string) {
    this.dataSource.data.forEach((choice) => choice.technology = undefined);
    this._nodeCode = code;
    this._dataService.readTechs(this._nodeCode)
      .then((techs) => this.availableTechnologies = techs)
      .catch((e) => console.error(e));
  }

  public get nodeCode() {
    return this._nodeCode;
  }
  public async ngOnInit() {
    await this._dataService.init();
    this.modelTypeOptions = [];
    this._dataService.nodeCodeToHumanReadable().forEach(
      (nodeName, nodeCode) => this.modelTypeOptions.push({nodeCode, nodeName}));
  }

  // TODO: Calculate base on technologies
  public getModels(): Model[] {
    return [{
      id: 0, company: 'mst', company_name: '', created: '', description: '', level: 0,
      name: this.modelName, node_type: '', node_type_code: this._nodeCode, nodes: [],
      params: { az_level: 100 }, size: this.size,
    }];
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

  public enableSlider(technologyChoice: TechnologyChoice): boolean {
    return technologyChoice.technology != undefined;
  }

  public getCost(technologyChoice: TechnologyChoice, col: string): number {
    if (!this.enableSlider(technologyChoice)) return 0;

    const technology = this.availableTechnologies.find((tech: Technology) => {
      return tech.id == technologyChoice.technology;
    });

    return technologyChoice.points * (technology.point_cost[col] || 0);
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
      .includes(tech.id);
  }
}
