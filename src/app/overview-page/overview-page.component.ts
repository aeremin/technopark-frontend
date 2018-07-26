import { Component } from '@angular/core';

@Component({
  selector: 'app-overview-page',
  templateUrl: './overview-page.component.html',
  styleUrls: ['./overview-page.component.css'],
})
export class OverviewPageComponent {
  public filter: string = '';
  public applyFilter(filterValue: string) {
    this.filter = filterValue.trim().toLowerCase();
  }
}
