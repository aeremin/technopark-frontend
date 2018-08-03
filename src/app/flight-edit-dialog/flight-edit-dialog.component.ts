import { Component } from '@angular/core';
import { DataService, User } from '../../services/data.service';

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

  public crew: any = {};

  constructor(private _dataService: DataService) { }

  public async ngOnInit() {
    this.users = await this._dataService.getActiveUsers();
    console.log(JSON.stringify(this.users));
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
  }
}
