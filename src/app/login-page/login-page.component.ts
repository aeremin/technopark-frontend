import { Component } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';

import { AuthService } from 'src/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent {
  public username: string;
  public password: string;

  constructor(
    private _router: Router,
    private _matSnackBar: MatSnackBar,
    private _authService: AuthService) { }

  public async login(): Promise<void> {
    try {
      await this._authService.login(this.username, this.password);
      // this._router.navigate(['history']);
    } catch (err) {
      console.warn(JSON.stringify(err));
      if (err.status == 404) {
        this.showLoginFailedAlert('Персонаж с данным ID не найден');
      } else if (err.status == 401) {
        this.showLoginFailedAlert('Неправильный пароль');
      } else {
        this.showLoginFailedAlert('Ошибка подключения к серверу, повторите попытку позже');
      }
      this._authService.logout();
    }
  }

  private showLoginFailedAlert(msg: string) {
    this._matSnackBar.open(msg, '', { duration: 2000 });
  }
}
