import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class GameMasterGuardService implements CanActivate {
  constructor(private _authService: AuthService, private _router: Router) {}

  public canActivate(): boolean {
    if (this._authService.getAccount() && this._authService.getAccount().professions
        && this._authService.getAccount().professions.isGameMaster) {
      return true;
    }
    return false;
  }
}
