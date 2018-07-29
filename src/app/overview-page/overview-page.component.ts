import { Component } from '@angular/core';
import { DataService, Model } from '../../services/data.service';

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

  // TODO: Set to false if not SuperCargo user or guest
  public showReservationColumn: boolean = true;

  constructor(private _dataService: DataService) {}

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
  }
}
