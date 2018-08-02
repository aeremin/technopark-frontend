import { Component, OnInit } from '@angular/core';
import { DataService, FullFlightInfo } from '../../services/data.service';

@Component({
  selector: 'app-schedule-dashboard',
  templateUrl: './schedule-dashboard.component.html',
  styleUrls: ['./schedule-dashboard.component.css'],
})
export class ScheduleDashboardComponent implements OnInit {
  public flights: FullFlightInfo[] = [];
  constructor(private _dataService: DataService) { }

  public async ngOnInit() {
    await this._dataService.init();
    this._dataService.getFlightsInfoObservable().subscribe((flightsInfo: FullFlightInfo[]) => {
      this.flights = flightsInfo;
    });
  }
}
