import { Component, Input } from '@angular/core';
import { FullFlightInfo } from '../../services/data.service';

@Component({
  selector: 'schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrls: ['./schedule-card.component.css'],
})
export class ScheduleCardComponent {
  public crewNames: string[] = [];
  public roles = ['supercargo', 'pilot', 'navigator', 'radist', 'engineer'];

  private _flight: FullFlightInfo = {id: 0, departure: '', dock: 0, crew: [], status: 'prepare'};

  @Input()
  public set flight(flight: FullFlightInfo) {
    console.log(JSON.stringify(flight));
    this._flight = flight;
    this.crewNames = flight.crew.map((v) => v.name);
  }

  public get flight() {
    return this._flight;
  }

  public getCrew(role: string) {
    const crewMember = this._flight.crew.find((m) => m.role == role);
    if (crewMember != undefined)
      return crewMember.name;
    else
      return '(неизвестно)';
  }

  public getOtherCrew() {
    const otherCrew = this._flight.crew
      .filter((crewMember) => crewMember.role == '_other')
      .map((crewMember) => crewMember.name);
    if (otherCrew.length)
      return otherCrew.join(', ');
    else
      return undefined;
  }
}
