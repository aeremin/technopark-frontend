import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { DataService, FullFlightInfo, User } from '../../services/data.service';

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

  public crew: any = { other: [] };

  private _originalFlight: FullFlightInfo;

  constructor(
    @Inject(MAT_DIALOG_DATA) data: any,
    private _dataService: DataService,
    private _dialogRef: MatDialogRef<FlightEditDialogComponent>) {
    this._originalFlight = data.flight;
    if (this._originalFlight != undefined) {
      for (const crewMember of this._originalFlight.crew) {
        if (crewMember.role == '_other')
          this.crew.other.push(crewMember.user_id);
        else
          this.crew[crewMember.role] = crewMember.user_id;
      }
      this.dock = this._originalFlight.dock;
      this.departureTime = this._originalFlight.departure.split(' ')[1];
      this.departureDate = new Date(this._originalFlight.departure.split(' ')[0]);
    }
  }

  public async ngOnInit() {
    this.users = await this._dataService.getActiveUsers();
  }

  public enableDateAndDockEditing(): boolean {
    return this._originalFlight == undefined;
  }

  public canSave() {
    return this.departureDate != undefined &&
           this.departureTime != undefined &&
           this.dock != undefined;
  }

  public async save() {
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

    try {
      let flightId: number;
      if (this.enableDateAndDockEditing()) {
        flightId = await this._dataService.createFlight(dateFormatted, this.dock);
      } else {
        flightId = this._originalFlight.id;
      }

      const crew = [];
      for (const role in this.crew) {
        if (this.crew.hasOwnProperty(role) && this.crew[role]) {
          if (role == 'other') {
            crew.push(...(this.crew[role].map((id) => ({ role: '_other', user_id: id }))));
          } else {
            crew.push({ role, user_id: this.crew[role] });
          }
        }
      }
      await this._dataService.setAllCrew(flightId, crew);
    } catch (err) {
      // TODO: show error to user?
      console.error(err);
    }
    this._dialogRef.close();
  }
}