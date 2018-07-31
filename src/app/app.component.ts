import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  public toolbarHeader = 'Магеллан';
  @ViewChild('snav') public sideNav: MatSidenav;

  constructor(router: Router) {
    // TODO: Also change this.toolbarHeader?
    router.events.subscribe(() => {
      this.sideNav.close();
    });
  }
}
