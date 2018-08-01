import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MatButtonModule, MatCardModule, MatDialogModule,
  MatIconModule, MatInputModule, MatListModule, MatSelectModule,
  MatSidenavModule, MatSliderModule, MatSlideToggleModule, MatSnackBarModule,
  MatSortModule, MatTableModule, MatTabsModule, MatToolbarModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from 'src/app/core/app.routing.module';
import { DataService } from 'src/services/data.service';
import { AppComponent } from './app.component';
import { InventionPageComponent } from './invention-page/invention-page.component';
import { OverviewPageComponent } from './overview-page/overview-page.component';
import { ReservationPasswordEnterComponent } from './reservation-password-enter/reservation-password-enter.component';
import { ReservationTableComponent } from './reservation-table/reservation-table.component';
import { ScheduleDashboardComponent } from './schedule-dashboard/schedule-dashboard.component';

@NgModule({
  declarations: [
    AppComponent,
    OverviewPageComponent,
    ReservationTableComponent,
    InventionPageComponent,
    ReservationPasswordEnterComponent,
    ScheduleDashboardComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    AppRoutingModule,
    HttpModule,
    HttpClientModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
  ],
  providers: [
    DataService,
  ],
  entryComponents: [ReservationPasswordEnterComponent],
  bootstrap: [AppComponent],
})
export class AppModule { }
