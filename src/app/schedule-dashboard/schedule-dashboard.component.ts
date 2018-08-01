import { Component, OnInit } from '@angular/core';
import { DataService, FullFlightInfo } from '../../services/data.service';

@Component({
  selector: 'app-schedule-dashboard',
  templateUrl: './schedule-dashboard.component.html',
  styleUrls: ['./schedule-dashboard.component.css'],
})
export class ScheduleDashboardComponent implements OnInit {
  public crewNames: string[] = [];
  public flight: FullFlightInfo = {id: 0, departure: '', dock: 0, crew: [], status: 'prepare'};

  constructor(private _dataService: DataService) { }

  public async ngOnInit() {
    await this._dataService.init();
    this._dataService.getFlightsInfoObservable().subscribe((flightsInfo: FullFlightInfo[]) => {
      this.crewNames = flightsInfo[0].crew.map((v) => v.name);
      this.flight = flightsInfo[0];
    });
  }

}
