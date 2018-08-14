import { Component, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { BackendException, DataService, Luggage, LuggageCode } from 'src/services/data.service';

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

  constructor(private _dataService: DataService,
              private _matSnackBar: MatSnackBar) {
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

  public async onAdd(luggageLine: LuggageLine) {
    try {
      await this._dataService.loadLuggage(this.flightId, luggageLine.code);
      this._matSnackBar.open('Груз добавлен на корабль', '', { duration: 2000 });
    } catch (err) {
      if (err instanceof BackendException)
        this._matSnackBar.open(`Ошибка: ${err.error}.`, '', { duration: 3000 });
      else
        this._matSnackBar.open(`Невозможно подключиться к серверу: ${err}.`, '', { duration: 3000 });
      console.error(err);
    }
  }

  public async onRemove(luggageLine: LuggageLine) {
    try {
      await this._dataService.unloadLuggage(this.flightId, luggageLine.code);
      this._matSnackBar.open('Груз выгружен с корабля', '', { duration: 2000 });
    } catch (err) {
      if (err instanceof BackendException)
        this._matSnackBar.open(`Ошибка: ${err.error}.`, '', { duration: 3000 });
      else
        this._matSnackBar.open(`Невозможно подключиться к серверу: ${err}.`, '', { duration: 3000 });
      console.error(err);
    }
  }

  private _luggageCodeToHumanReadable(code: LuggageCode): string {
    return {
      mine: 'Шахта',
      beacon: 'Маяк',
      module: 'Посадочный модуль',
    }[code];
  }
}
