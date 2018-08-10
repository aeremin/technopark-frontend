import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatTableDataSource } from '@angular/material';
import { combineLatest } from 'rxjs';
import { AuthService } from 'src/services/auth.service';
import { CorpTopManagerGuardService } from 'src/services/corp.topmanager.guard.service';
import { BackendException, DataService, EconomicPump, Model, Node } from 'src/services/data.service';
import { getCost, getTotalCost } from '../util';

interface EconomicPumpExtended extends EconomicPump {
  isDeletable: boolean;
}

@Component({
  selector: 'app-economics-page',
  templateUrl: './economics-page.component.html',
  styleUrls: ['./economics-page.component.css'],
})
export class EconomicsPageComponent implements OnInit {

  public dataSource = new MatTableDataSource<EconomicPumpExtended>();

  constructor(private _dataService: DataService,
              private _authService: AuthService,
              private _corpTopManagerGuardService: CorpTopManagerGuardService,
              private _matSnackBar: MatSnackBar) { }

  public ngOnInit() {
    combineLatest(this._dataService.getEconomicPumpsObservable(),
      this._dataService.readAllModelsObservable()).subscribe({
        next: ([pumps, models]) => this._updateData(pumps, models),
      });
  }

  public getAllColumns() {
    return ['section', 'comment']
      .concat(this.getCostsColumns())
      .concat(this._corpTopManagerGuardService.canActivate() ? ['button'] : []);
  }

  public getCostsColumns() {
    return this._dataService.resouceCodes();
  }

  public humanReadableColumnName(columnCode: string) {
    return this._dataService.resourceCodeToHumanReadable(columnCode);
  }

  public getCost(pump: EconomicPumpExtended, col: string): number {
    return getCost(pump, col);
  }

  public getTotalCost(col: string): number {
    return getTotalCost(this.dataSource.data, col);
  }

  public commentClass(pump: EconomicPumpExtended): string {
    return this._isNodePump(pump) ? 'padded-text' : 'normal-text';
  }

  public sectionToHumanReadable(section: string) {
    return {
      mines: 'Шахты',
      models: 'Модели',
      nodes: 'Узлы',
    }[section] || section;
  }

  public hasButton(pump: EconomicPumpExtended): boolean {
    return pump.section != 'mines';
  }

  public onButton(pump: EconomicPumpExtended) {
    if (this._isNodePump(pump)) {
      // TODO: Send request to server
      console.log('Deleting node');
    } else {
      // TODO: Password?
      try {
        this._dataService.createNode(Number(pump.entity_id));
        this._matSnackBar.open('Узел создан успешно', '', { duration: 2000 });
      } catch (err) {
        if (err instanceof BackendException)
          this._matSnackBar.open(`Ошибка: ${err.error}.`, '', { duration: 3000 });
        else
          this._matSnackBar.open(`Невозможно подключиться к серверу: ${err}.`, '', { duration: 3000 });
        console.log(err);
      }
    }
  }
  public disableButton(pump: EconomicPumpExtended): boolean {
    return this._isNodePump(pump) && !pump.isDeletable;
  }

  public getButtonIcon(pump: EconomicPumpExtended): string {
    return this._isNodePump(pump) ? 'delete_forever' : 'add_library';
  }

  public getButtonTooltip(pump: EconomicPumpExtended): string {
    return this._isNodePump(pump) ? 'Списать узел' : 'Создать узел';
  }

  private _isNodePump(pump: EconomicPumpExtended): boolean {
    return pump.section == 'nodes';
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

    const pumpsReordered: EconomicPumpExtended[] = pumps
      .filter((pump) => pump.section == 'mines')
      .map((pump) => ({...pump, isDeletable: false }));

    for (const model of companyModels) {
      pumpsReordered.push(this._dummyModelPump(model));
      for (const node of model.nodes) {
        if (nodeIdToPump.has(node.id))
          pumpsReordered.push({...nodeIdToPump.get(node.id), isDeletable: node.status_code == 'free'});
        else
          pumpsReordered.push(this._dummyNodePump(model, node));
      }
    }

    const otherPumps = pumps.filter((pump) => pump.section != 'nodes' && pump.section != 'mines');
    if (otherPumps.length) console.log(JSON.stringify(otherPumps));

    this.dataSource.data = pumpsReordered;
  }

  private _dummyNodePump(model: Model, node: Node): EconomicPumpExtended {
    return {
      isDeletable: node.status_code == 'free',
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

  private _dummyModelPump(model: Model): EconomicPumpExtended {
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
      isDeletable: false,
    };
  }

}
