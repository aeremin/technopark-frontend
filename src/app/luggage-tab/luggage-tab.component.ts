import { Component, Input } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { MatTableDataSource } from '@angular/material/table';
import { BackendException, DataService, Luggage, LuggageCode } from 'src/services/data.service';
import { EnterPlanetDialogComponent } from '../enter-planet-dialog/enter-planet-dialog.component';
import { Company, kCompanyCodeToHumanReadableName } from '../util';

interface LuggageLine {
  code: LuggageCode;
  company?: Company;
  planet?: string;
  name: string;
  amount: number;
  weight: number;
  volume: number;
  weightTotal: number;
  volumeTotal: number;
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
              private _matSnackBar: MatSnackBar,
              private _matDialog: MatDialog) {
    this.luggage = [];
  }

  @Input()
  public set luggage(luggage: Luggage[]) {
    this._setLuggageImpl(luggage);
  }

  public getAllColumns(): string[] {
    return ['name', 'weight', 'volume', 'amount', 'buttons', 'weight_total', 'volume_total'];
  }

  public async onAdd(luggageLine: LuggageLine) {
    let planet: string;
    if (luggageLine.code == 'module') {
      const dialogRef = this._matDialog.open(EnterPlanetDialogComponent);
      planet = await dialogRef.afterClosed().toPromise();
      console.log(planet);
      if (planet == undefined) return;
    }

    try {
      await this._dataService.loadLuggage(this.flightId, luggageLine.code, luggageLine.company, planet);
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
      await this._dataService.unloadLuggage(this.flightId, luggageLine.code, luggageLine.company, luggageLine.planet);
      this._matSnackBar.open('Груз выгружен с корабля', '', { duration: 2000 });
    } catch (err) {
      if (err instanceof BackendException)
        this._matSnackBar.open(`Ошибка: ${err.error}.`, '', { duration: 3000 });
      else
        this._matSnackBar.open(`Невозможно подключиться к серверу: ${err}.`, '', { duration: 3000 });
      console.error(err);
    }
  }

  public enableAdd(luggageLine: LuggageLine) {
    if (luggageLine.code != 'module') return true;
    return luggageLine.amount < 1;
  }

  public getName(luggageLine: LuggageLine): string {
    return luggageLine.name + (luggageLine.planet ? ` (планета: ${luggageLine.planet})` : '');
  }

  private async _setLuggageImpl(luggage: Luggage[]) {
    const luggageTypesInfo = await this._dataService.luggagesInfo();
    const nextLuggageLines: LuggageLine[] = [];
    for (const code of ['module', 'beacon'] as LuggageCode[]) {
      const maybeLuggage = luggage.find((l) => l.code == code);
      const luggageInfo = luggageTypesInfo.find((info) => info.code == code);
      const amount = maybeLuggage == undefined ? 0 : maybeLuggage.amount;
      nextLuggageLines.push({
       code,
       name: this._luggageCodeToHumanReadable(code),
       amount,
       volume: luggageInfo.volume,
       weight: luggageInfo.weight,
       volumeTotal: luggageInfo.volume * amount,
       weightTotal: luggageInfo.weight * amount,
       planet: maybeLuggage == undefined ? undefined : maybeLuggage.planet_id,
      });
    }

    kCompanyCodeToHumanReadableName.forEach((companyName: string, company: Company) => {
      const maybeLuggage = luggage.find((l) => l.code == 'mine' && l.company == company);
      const luggageInfo =
        luggageTypesInfo.find((info) => info.code == 'mine' && info.company == company);
      const amount = maybeLuggage == undefined ? 0 : maybeLuggage.amount;
      nextLuggageLines.push({
        code: 'mine',
        company,
        name: `Шахта компании ${companyName}`,
        amount,
        volume: luggageInfo.volume,
        weight: luggageInfo.weight,
        volumeTotal: luggageInfo.volume * amount,
        weightTotal: luggageInfo.weight * amount,
       });
    });

    this.dataSource.data = nextLuggageLines;
  }

  private _luggageCodeToHumanReadable(code: LuggageCode): string {
    return {
      mine: 'Шахта',
      beacon: 'Маяк',
      module: 'Посадочный модуль',
    }[code];
  }
}
