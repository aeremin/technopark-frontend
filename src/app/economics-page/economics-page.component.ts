import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatTableDataSource } from '@angular/material';
import { combineLatest } from 'rxjs';
import { AuthService } from 'src/services/auth.service';
import { CorpTopManagerGuardService } from 'src/services/corp.topmanager.guard.service';
import { BackendException, DataService, EconomicPump, Model, Node } from 'src/services/data.service';
import { getCost } from '../util';

interface EconomicPumpExtended extends EconomicPump {
  isDeletable: boolean;
  password?: string;
}

@Component({
  selector: 'app-economics-page',
  templateUrl: './economics-page.component.html',
  styleUrls: ['./economics-page.component.css'],
})
export class EconomicsPageComponent implements OnInit {
  public dataSource = new MatTableDataSource<EconomicPumpExtended>();

  private _totalCompanyIncome: any = {};

  constructor(private _dataService: DataService,
              private _authService: AuthService,
              private _corpTopManagerGuardService: CorpTopManagerGuardService,
              private _matSnackBar: MatSnackBar) { }

  public async ngOnInit() {
    await this._dataService.init();

    this._dataService.companyIncomeObservable().subscribe({
      next: (income) => this._totalCompanyIncome = income,
    });

    combineLatest(
      this._dataService.getEconomicPumpsObservable(),
      this._dataService.readModelsInfoObservable()).subscribe({
        next: ([pumps, modelsInfo]) => this._updateData(pumps, modelsInfo.models),
      });
  }

  public getAllColumns() {
    return ['comment']
      .concat(this.getCostsColumns())
      .concat(this._corpTopManagerGuardService.canActivate() ? ['button'] : []);
  }

  public getCostsColumns() {
    return this._dataService.resouceCodes();
  }

  public humanReadableColumnName(columnCode: string) {
    return this._dataService.resourceCodeToHumanReadable(columnCode);
  }

  public getCost(pump: EconomicPumpExtended, col: string): string {
    if (pump.section == 'meta') return '';
    return getCost(pump, col).toString();
  }

  public getTotalCost(col: string): number {
    return this._totalCompanyIncome[col] || 0;
  }

  public commentClass(pump: EconomicPumpExtended): string {
    const indent: number = {
      mines: 1,
      models: 1,
      nodes: 2,
      meta: 0,
    }[pump.section] || 0;
    return `padded-text-${indent}`;
  }

  public sectionToHumanReadable(section: string) {
    return {
      mines: 'Шахты',
      models: 'Модели',
      nodes: 'Узлы',
    }[section] || section;
  }

  public hasButton(pump: EconomicPumpExtended): boolean {
    return pump.section == 'nodes' || pump.section == 'models';
  }

  public async onButton(pump: EconomicPumpExtended) {
    if (this._isNodePump(pump)) {
      try {
        await this._dataService.deleteNode(Number(pump.entity_id));
        this._matSnackBar.open('Узел списан успешно', '', { duration: 2000 });
      } catch (err) {
        if (err instanceof BackendException)
          this._matSnackBar.open(`Ошибка: ${err.error}.`, '', { duration: 3000 });
        else
          this._matSnackBar.open(`Невозможно подключиться к серверу: ${err}.`, '', { duration: 3000 });
        console.log(err);
      }
    } else {
      try {
        await this._dataService.createNode(Number(pump.entity_id));
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

  public getComment(pump: EconomicPumpExtended): string {
    return pump.comment + ((pump.password && pump.password.length)
      ? ` (пароль: ${pump.password})` : '');
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
    const modelTypeToModel = new Map<string, Model[]>();
    companyModels.forEach((model) => {
      if (modelTypeToModel.has(model.node_type_code))
        modelTypeToModel.get(model.node_type_code).push(model);
      else
        modelTypeToModel.set(model.node_type_code, [model]);
    });

    const nodeIdToPump = new Map<number, EconomicPump>();
    pumps
      .filter((pump) => pump.section == 'nodes')
      .forEach((pump) => nodeIdToPump.set(Number(pump.entity_id), pump));

    const modelIdToPump = new Map<number, EconomicPump>();
    pumps
      .filter((pump) => pump.section == 'models')
      .forEach((pump) => modelIdToPump.set(Number(pump.entity_id), pump));

    const pumpsReordered = [this._dummyCategoryPump('Шахты')];
    pumpsReordered.push(...pumps
      .filter((pump) => pump.section == 'mines')
      .map((pump) => ({ ...pump, isDeletable: false })));

    modelTypeToModel.forEach((modelsPerType, modelTypeCode) => {
      pumpsReordered.push(this._dummyCategoryPump(this._dataService.nodeCodeToHumanReadable().get(modelTypeCode)));
      for (const model of modelsPerType) {
        if (modelIdToPump.has(model.id))
          pumpsReordered.push({ ...modelIdToPump.get(model.id), isDeletable: false });
        else
          pumpsReordered.push(this._dummyModelPump(model));
        for (const node of model.nodes) {
          if (nodeIdToPump.has(node.id))
            pumpsReordered.push({ ...nodeIdToPump.get(node.id),
              isDeletable: node.status == 'free', password: node.password });
          else
            pumpsReordered.push(this._dummyNodePump(model, node));
        }
      }
    });

    this.dataSource.data = pumpsReordered;
  }

  private _dummyNodePump(model: Model, node: Node): EconomicPumpExtended {
    return {
      isDeletable: node.status == 'free',
      comment: `Поддержка узла ${node.id} модели ${model.name}`,
      company: this._authService.getCompany(),
      date_begin: '',
      date_end: '',
      entity_id: node.id.toString(),
      id: 0,
      is_income: 0,
      resources: {},
      section: 'nodes',
      password: node.password,
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

  private _dummyCategoryPump(category: string): EconomicPumpExtended {
    return {
      comment: category,
      company: this._authService.getCompany(),
      date_begin: '',
      date_end: '',
      id: 0,
      is_income: 0,
      resources: {},
      section: 'meta',
      isDeletable: false,
    };
  }

}
