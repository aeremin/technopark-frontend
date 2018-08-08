import { Injectable } from '@angular/core';
import { Headers, Http, RequestOptionsArgs } from '@angular/http';
import { Subject } from 'rxjs';

export interface Professions {
  isPilot: boolean;
  isNavigator: boolean;
  isCommunications: boolean;
  isSupercargo: boolean;
  isEngineer: boolean;
  isBiologist: boolean;
  isPlanetolog: boolean;
  isJournalist: boolean;
  isIdelogist: boolean;
  isTopManager: boolean;
  isSecurity: boolean;
  isManager: boolean;
  isGameMaster?: boolean;
}

export type Company = 'gd' | 'pre' | 'kkg' | 'mat' | 'mst';

export interface CompanyAccess {
  isTopManager: boolean;
  companyName: Company;
}

export interface Account {
  _id: string;
  login?: string;
  password: string;
  professions: Professions;
  companyAccess: CompanyAccess[];
}

@Injectable()
export class AuthService {
  public accountSubject = new Subject<Account>();
  private _account: Account;

  constructor(private _http: Http) { }

  public async login(loginOrUserId: string, password: string): Promise<void> {
    const response = await this._http.get('https://api.alice.magellan2018.ru/account',
      this.getRequestOptionsWithCredentials(loginOrUserId, password)).toPromise();
    this._account = response.json().account;
    this.accountSubject.next(this._account);
  }

  public async logout() {
    this._account = null;
    this.accountSubject.next(this._account);
  }

  public getAccount(): Account {
    return this._account;
  }

  private getRequestOptionsWithCredentials(userId: string, password: string): RequestOptionsArgs {
    return {
      headers: new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + btoa(userId + ':' + password),
      }),
    };
  }
}
