import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { combineLatest } from 'rxjs';
import { AuthService } from 'src/services/auth.service';
import { DataService, EconomicPump, Model, Node } from 'src/services/data.service';
import { getCost, getTotalCost } from '../util';

@Component({
  selector: 'app-economics-page',
  templateUrl: './economics-page.component.html',
  styleUrls: ['./economics-page.component.css'],
})
export class EconomicsPageComponent implements OnInit {

  public dataSource = new MatTableDataSource<EconomicPump>();

  constructor(private _dataService: DataService,
              private _authService: AuthService) { }

  public ngOnInit() {
    combineLatest(this._dataService.getEconomicPumpsObservable(),
      this._dataService.readAllModelsObservable()).subscribe({
        next: ([pumps, models]) => this._updateData(pumps, models),
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
    return getCost(pump, col);
  }

  public getTotalCost(col: string): number {
    return getTotalCost(this.dataSource.data, col);
  }

  public commentClass(pump: EconomicPump): string {
    return pump.section == 'nodes' ? 'padded-text' : 'normal-text';
  }

  private _updateData(pumps: EconomicPump[], models: Model[]) {
    if (!this._authService.getCompany()) {
      this.dataSource.data = [];
      return;
    }
    const companyModels = models.filter((model) => model.company == this._authService.getCompany());

    const nodeIdToPump = new Map<number, EconomicPump>();
    pumps
      .filter((pump) => pump.section == 'nodes')
      .forEach((pump) => nodeIdToPump.set(Number(pump.entity_id), pump));

    const pumpsReordered = pumps.filter((pump) => pump.section == 'mines');

    for (const model of companyModels) {
      pumpsReordered.push(this._dummyModelPump(model));
      for (const node of model.nodes) {
        if (nodeIdToPump.has(node.id))
        pumpsReordered.push(nodeIdToPump.get(node.id));
        else
        pumpsReordered.push(this._dummyNodePump(model, node));
      }
    }

    const otherPumps = pumps.filter((pump) => pump.section != 'nodes' && pump.section != 'mines');
    if (otherPumps.length) console.log(JSON.stringify(otherPumps));

    this.dataSource.data = pumpsReordered;
  }

  private _dummyNodePump(model: Model, node: Node): EconomicPump {
    return {
      comment: `Поддержка узла ${node.id} модели ${model.name}`,
      company: this._authService.getCompany(),
      date_begin: '',
      date_end: '',
      entity_id: node.id.toString(),
      id: 0,
      is_income: 0,
      resources: {},
      section: 'nodes',
    };
  }

  private _dummyModelPump(model: Model): EconomicPump {
    return {
      comment: `Поддержка модели ${model.name}`,
      company: this._authService.getCompany(),
      date_begin: '',
      date_end: '',
      entity_id: model.id.toString(),
      id: 0,
      is_income: 0,
      resources: {},
      section: 'models',
    };
  }

}
