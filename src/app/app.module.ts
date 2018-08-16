import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MatButtonModule, MatCardModule, MatDatepickerModule,
  MatDialogModule, MatIconModule, MatInputModule, MatListModule,
  MatNativeDateModule, MatSelectModule, MatSidenavModule, MatSliderModule,
  MatSlideToggleModule, MatSnackBarModule, MatSortModule, MatTableModule,
  MatTabsModule, MatToolbarModule, MatTooltipModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { CorpTopManagerGuardService } from 'src/services/corp.topmanager.guard.service';
import { RaspberryService } from 'src/services/raspberry.service';
import { AuthService } from '../services/auth.service';
import { CorpGuardService } from '../services/corp.guard.service';
import { DataService } from '../services/data.service';
import { GameMasterGuardService } from '../services/gamemaster.guard.service';
import { LoggedGuardService } from '../services/logged.guard.service';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './core/app.routing.module';
import { EconomicsPageComponent } from './economics-page/economics-page.component';
import { EnterPlanetDialogComponent } from './enter-planet-dialog/enter-planet-dialog.component';
import { FlightEditDialogComponent } from './flight-edit-dialog/flight-edit-dialog.component';
import { GamemasterGenericTableComponent } from './gamemaster-generic-table/gamemaster-generic-table.component';
import { InventionPageComponent } from './invention-page/invention-page.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { LuggageTabComponent } from './luggage-tab/luggage-tab.component';
import { OverviewPageComponent } from './overview-page/overview-page.component';
import { ReservationPasswordEnterComponent } from './reservation-password-enter/reservation-password-enter.component';
import { ReservationTableComponent } from './reservation-table/reservation-table.component';
import { ScheduleCardComponent } from './schedule-card/schedule-card.component';
import { ScheduleDashboardComponent } from './schedule-dashboard/schedule-dashboard.component';
import { RaspberryLandingPageComponent } from './raspberry-landing-page/raspberry-landing-page.component';

@NgModule({
  declarations: [
    AppComponent,
    OverviewPageComponent,
    ReservationTableComponent,
    InventionPageComponent,
    ReservationPasswordEnterComponent,
    ScheduleDashboardComponent,
    ScheduleCardComponent,
    FlightEditDialogComponent,
    GamemasterGenericTableComponent,
    LoginPageComponent,
    EconomicsPageComponent,
    LuggageTabComponent,
    EnterPlanetDialogComponent,
    RaspberryLandingPageComponent,
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
    MatDatepickerModule,
    MatDialogModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatNativeDateModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
  ],
  providers: [
    AuthService,
    DataService,
    CorpGuardService,
    CorpTopManagerGuardService,
    GameMasterGuardService,
    LoggedGuardService,
    RaspberryService,
  ],
  entryComponents: [
    ReservationPasswordEnterComponent,
    FlightEditDialogComponent,
    EnterPlanetDialogComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
