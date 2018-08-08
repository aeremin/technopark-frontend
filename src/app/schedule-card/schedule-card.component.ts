import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { FullFlightInfo } from '../../services/data.service';
import { FlightEditDialogComponent } from '../flight-edit-dialog/flight-edit-dialog.component';

@Component({
  selector: 'schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.css'],
})
export class ScheduleCardComponent {
  public crewNames: string[] = [];
  public roles = ['supercargo', 'pilot', 'navigator', 'radist', 'engineer'];

  @Input()
  public flight: FullFlightInfo;

  constructor(private _matDialog: MatDialog) {}

  public getCrew(role: string) {
    const crewMember = this.flight.crew.find((m) => m.role == role);
    if (crewMember != undefined)
      return crewMember.name;
    else
      return '(неизвестно)';
  }

  public getOtherCrew() {
    const otherCrew = this.flight.crew
      .filter((crewMember) => crewMember.role == '_other')
      .map((crewMember) => crewMember.name);
    if (otherCrew.length)
      return otherCrew.join(', ');
    else
      return undefined;
  }

  public isAdminMode() {
    // TODO: Check if admin is logged in
    return true;
  }

  public edit() {
    this._matDialog.open(FlightEditDialogComponent, {
      data: { flight: this.flight },
    });
  }

  public getCompanyIcon() {
    return `assets/company_${this.flight.company || 'ideolog'}_40.png`;
  }
}
