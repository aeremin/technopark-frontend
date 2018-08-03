import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { DataService, User, FullFlightInfo } from '../../services/data.service';

@Component({
  selector: 'app-flight-edit-dialog',
  templateUrl: './flight-edit-dialog.component.html',
  styleUrls: ['./flight-edit-dialog.component.css'],
})
export class FlightEditDialogComponent {
  public startDate = new Date(2435, 8, 1);
  public departureDate: any;
  // TODO: Use real departure times
  public departureTimes = [
    '12:00:00',
    '15:00:00',
    '18:00:00',
  ];
  public departureTime: string;

  public docks = [1, 2, 3, 4, 5];
  public dock: number;

  public roles = ['supercargo', 'pilot', 'navigator', 'radist', 'engineer'];
  public users: User[] = [];

  public crew: any = {other: []};

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dataService: DataService) {
      const flight: FullFlightInfo = data.flight;
      // TODO: Support flight == undefined (new flight creation)
      for (const crewMember of flight.crew) {
        if (crewMember.role == '_other')
          this.crew.other.push(crewMember.user_id);
        else
          this.crew[crewMember.role] = crewMember.user_id;
      }
      this.dock = flight.dock;
      this.departureTime = flight.departure.split(' ')[1];
      this.departureDate = new Date(flight.departure.split(' ')[0]);
    }

  public async ngOnInit() {
    this.users = await this._dataService.getActiveUsers();
  }

  public save() {
    const d = new Date(this.departureDate);
    const dateFormatted =
      d.getFullYear().toString() +
      '-' +
      ((d.getMonth() + 1).toString().length == 2
        ? (d.getMonth() + 1).toString()
        : '0' + (d.getMonth() + 1).toString()) +
      '-' +
      (d.getDate().toString().length == 2 ? d.getDate().toString() : '0' + d.getDate().toString())
      + ' ' + this.departureTime;

    console.log(JSON.stringify({
      departure: dateFormatted,
      dock: this.dock,
      crew: this.crew,
    }));

    // TODO: Submit some requests to server
  }
}
