import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { GameMasterGuardService } from 'src/services/gamemaster.guard.service';
import { AuthService } from '../../services/auth.service';
import { FullFlightInfo } from '../../services/data.service';
import { FlightEditDialogComponent } from '../flight-edit-dialog/flight-edit-dialog.component';
import { kFlightDepartureTimes } from '../util';

@Component({
  selector: 'schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.css'],
})
export class ScheduleCardComponent {
  public roles = ['supercargo', 'pilot', 'navigator', 'radist', 'engineer'];

  @Input()
  public flight: FullFlightInfo;

  constructor(private _gameMasterGuardService: GameMasterGuardService,
              private _authService: AuthService,
              private _matDialog: MatDialog) {}

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
    return this._gameMasterGuardService.canActivate();
  }

  public edit() {
    this._matDialog.open(FlightEditDialogComponent, {
      data: { flight: this.flight },
    });
  }

  public getCompanyOrIdeolog() {
    const lastDayOfTheGame = this.flight.departure.startsWith('18');
    const ideologWave = lastDayOfTheGame ? 3 : 6;
    return this.flight.departure.split(' ')[1] == kFlightDepartureTimes[ideologWave - 1]
      ? 'ideolog' : this.flight.company;
  }

  public getCompanyIcon() {
    return `assets/company_${this.getCompanyOrIdeolog()}_40.png`;
  }

  public isMyFlight(): boolean {
    return this._authService.getAccount() && this._flightIncludes(Number(this._authService.getAccount()._id));
  }

  private _flightIncludes(id: number): boolean {
    return this.flight.crew.some((crewMember) => crewMember.user_id == id);
  }
}
