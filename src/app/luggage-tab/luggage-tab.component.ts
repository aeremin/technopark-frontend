import { Component, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { DataService, Luggage, LuggageCode } from 'src/services/data.service';

interface LuggageLine {
  code: LuggageCode;
  name: string;
  amount: number;
}

@Component({
  selector: 'luggage-tab',
  templateUrl: './luggage-tab.component.html',
  styleUrls: ['./luggage-tab.component.css'],
})
export class LuggageTabComponent {
  public dataSource = new MatTableDataSource<LuggageLine>([]);

  @Input()
  public flightId: number;

  constructor(private _dataService: DataService) {
    this.luggage = [];
  }

  @Input()
  public set luggage(luggage: Luggage[]) {
    const nextLuggageLines: LuggageLine[] = [];
    for (const code of ['module', 'mine', 'beacon'] as LuggageCode[]) {
      const maybeLuggage = luggage.find((l) => l.code == code);
      nextLuggageLines.push({
       code,
       name: this._luggageCodeToHumanReadable(code),
       amount: maybeLuggage == undefined ? 0 : maybeLuggage.amount,
      });
    }
    this.dataSource.data = nextLuggageLines;
  }

  public getAllColumns(): string[] {
    return ['name', 'amount', 'buttons'];
  }

  public onAdd(luggageLine: LuggageLine) {
    this._dataService.loadLuggage(this.flightId, luggageLine.code);
  }

  public onRemove(luggageLine: LuggageLine) {
    this._dataService.unloadLuggage(this.flightId, luggageLine.code);
  }

  private _luggageCodeToHumanReadable(code: LuggageCode): string {
    return {
      mine: 'Шахта',
      beacon: 'Маяк',
      module: 'Посадочный модуль',
    }[code];
  }
}
