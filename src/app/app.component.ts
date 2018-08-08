import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';
import { CorpTopManagerGuardService } from 'src/services/corp.topmanager.guard.service';
import { GameMasterGuardService } from 'src/services/gamemaster.guard.service';
import { LoggedGuardService } from 'src/services/logged.guard.service';
import { AuthService } from '../services/auth.service';

interface MenuItem {
  link: string;
  title: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public toolbarHeader = 'Магеллан';
  @ViewChild('snav') public sideNav: MatSidenav;

  public menuItems: MenuItem[] = [];

  constructor(router: Router,
              authService: AuthService,
              private _corpTopManagerGuardService: CorpTopManagerGuardService,
              private _gameMasterGuardService: GameMasterGuardService,
              private _loggedGuardService: LoggedGuardService) {
    // TODO: Also change this.toolbarHeader?
    router.events.subscribe(() => {
      if (this.sideNav)
        this.sideNav.close();
    });

    authService.accountSubject.subscribe(() => this._updateMenuItems());
    this._updateMenuItems();
  }

  private _updateMenuItems() {
    this.menuItems = [];
    if (!this._loggedGuardService.canActivate()) {
      this.menuItems.push({title: 'Авторизация', link: '/'});
    }
    this.menuItems.push({title: 'Технопарк', link: '/overview'});
    if (this._corpTopManagerGuardService.canActivate()) {
      this.menuItems.push({title: 'Создание модели', link: '/invention'});
    }
    this.menuItems.push({title: 'Расписание вылетов', link: '/schedule'});
    if (this._gameMasterGuardService.canActivate()) {
      this.menuItems.push({title: 'Универсальные мастерские таблички', link: '/generic_table'});
    }
  }
}
