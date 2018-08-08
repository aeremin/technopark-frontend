import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class LoggedGuardService implements CanActivate {
  constructor(private _authService: AuthService, private _router: Router) {}

  public canActivate(): boolean {
    if (this._authService.getAccount()) {
      return true;
    }
    return false;
  }
}
