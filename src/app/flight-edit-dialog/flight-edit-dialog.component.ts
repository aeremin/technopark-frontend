import { Component } from '@angular/core';

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

  constructor() { }

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
    }));
  }
}
