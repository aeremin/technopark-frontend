import { Component } from '@angular/core';
import { DataService } from '../../services/data.service';

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

  constructor(private _dataService: DataService) {}

  public applyFilter(filterValue: string) {
    this.filter = filterValue.trim().toLowerCase();
  }

  public async ngOnInit() {
    await this._dataService.loadStaticData();
    this.tabs = [];
    this._dataService.nodeCodeToHumanReadable().forEach(
      (nodeName, nodeCode) => this.tabs.push({nodeCode, nodeName}));
  }
}
