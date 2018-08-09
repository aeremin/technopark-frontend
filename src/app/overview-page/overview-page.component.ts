import { Component } from '@angular/core';
import { DataService, Model } from '../../services/data.service';
import { LoggedGuardService } from '../../services/logged.guard.service';

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
  public models: Model[];
  public filterUnavailable: boolean = true;
  public onlyBestNodes: boolean = true;

  public showReservationColumn: boolean = false;

  constructor(private _dataService: DataService,
              private _loggedGuardService: LoggedGuardService) {}

  public applyFilter(filterValue: string) {
    this.filter = filterValue.trim().toLowerCase();
  }

  public async ngOnInit() {
    await this._dataService.init();
    this._dataService.readAllModelsObservable().subscribe({
      next: (models) => this.models = models,
    });
    this.tabs = [];
    this._dataService.nodeCodeToHumanReadable().forEach(
      (nodeName, nodeCode) => this.tabs.push({nodeCode, nodeName}));

    // hull should be first tab
    const weightFn = (nodeCode) => nodeCode == 'hull' ? 0 : 1;
    this.tabs.sort((a, b) => weightFn(a.nodeCode) - weightFn(b.nodeCode));

    this._dataService.isAssignedSupercargoObservable().subscribe({
      next: (isAssignedSupercargo) => this.showReservationColumn = isAssignedSupercargo,
    });
  }
}
