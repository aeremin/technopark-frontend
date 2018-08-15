import { Component } from '@angular/core';
import { DataService, ModelsInfo, BackendException } from '../../services/data.service';
import { LoggedGuardService } from '../../services/logged.guard.service';
import { getVolumeWeightInfo, VolumeWeightInfo } from '../util';
import { MatSnackBar } from '../../../node_modules/@angular/material';

interface TabData {
  nodeCode: string;
  nodeName: string;
}

@Component({
  selector: 'app-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.css'],
})
export class OverviewPageComponent {
  public filter: string = '';
  public tabs: TabData[];
  public modelsInfo: ModelsInfo;
  public volumeWeightInfo: VolumeWeightInfo;
  public filterUnavailable: boolean = true;
  public onlyBestNodes: boolean = true;

  public flightId: number;

  constructor(private _dataService: DataService,
              private _loggedGuardService: LoggedGuardService,
              private _matSnackBar: MatSnackBar) {}

  public applyFilter(filterValue: string) {
    this.filter = filterValue.trim().toLowerCase();
  }

  public async ngOnInit() {
    await this._dataService.init();
    this._dataService.readModelsInfoObservable().subscribe({
      next: (modelsInfo) => {
        this.modelsInfo = modelsInfo;
        this.volumeWeightInfo = getVolumeWeightInfo(modelsInfo);
      },
    });
    this.tabs = [];
    this._dataService.nodeCodeToHumanReadable().forEach(
      (nodeName, nodeCode) => this.tabs.push({nodeCode, nodeName}));

    // hull should be first tab
    const weightFn = (nodeCode) => nodeCode == 'hull' ? 0 : 1;
    this.tabs.sort((a, b) => weightFn(a.nodeCode) - weightFn(b.nodeCode));

    this._dataService.isAssignedSupercargoObservable().subscribe({
      next: (flightId) => this.flightId = flightId,
    });
  }

  public getVolumeClass(): string {
    return (this.volumeWeightInfo.totalVolume > this.volumeWeightInfo.maxVolume)
      ? 'red-text' : 'normal-text';
  }

  public async onFreight() {
    try {
      console.log(this.flightId);
      await this._dataService.freightShip(this.flightId);
      this._matSnackBar.open('Корабль зафрахтован', '', { duration: 2000 });
    } catch (err) {
      if (err instanceof BackendException)
        this._matSnackBar.open(`Ошибка: ${err.error}.`, '', { duration: 3000 });
      else
        this._matSnackBar.open(`Невозможно подключиться к серверу: ${err}.`, '', { duration: 3000 });
      console.log(err);
    }
  }
}
