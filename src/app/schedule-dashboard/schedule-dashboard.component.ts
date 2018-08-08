import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { DataService, FullFlightInfo } from '../../services/data.service';
import { FlightEditDialogComponent } from '../flight-edit-dialog/flight-edit-dialog.component';

@Component({
  selector: 'app-schedule-dashboard',
  templateUrl: './schedule-dashboard.component.html',
  styleUrls: ['./schedule-dashboard.component.css'],
})
export class ScheduleDashboardComponent implements OnInit {
  public flights: FullFlightInfo[] = [];
  constructor(private _dataService: DataService,
              private _matDialog: MatDialog) { }

  public async ngOnInit() {
    await this._dataService.init();
    this._dataService.getFlightsInfoObservable().subscribe((flightsInfo: FullFlightInfo[]) => {
      this.flights = flightsInfo;
    });
  }

  public async newFlight() {
    this._matDialog.open(FlightEditDialogComponent, { data: {} });
  }
}
