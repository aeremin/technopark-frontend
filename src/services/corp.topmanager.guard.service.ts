import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class CorpTopManagerGuardService implements CanActivate {
  constructor(private _authService: AuthService, private _router: Router) {}

  public canActivate(): boolean {
    if (this._authService.getAccount() && this._authService.getAccount().companyAccess
      && this._authService.getAccount().companyAccess.length
      && this._authService.getAccount().companyAccess[0].isTopManager) {
      return true;
    }
    return false;
  }
}
