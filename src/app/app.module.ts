import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { MatButtonModule, MatInputModule, MatSelectModule,
  MatSnackBarModule, MatSortModule, MatTableModule, MatTabsModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from 'src/app/core/app.routing.module';
import { DataService } from 'src/services/data.service';
import { AppComponent } from './app.component';
import { OverviewPageComponent } from './overview-page/overview-page.component';
import { ReservationTableComponent } from './reservation-table/reservation-table.component';

@NgModule({
  declarations: [
    AppComponent,
    OverviewPageComponent,
    ReservationTableComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpModule,
    HttpClientModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
  ],
  providers: [
    DataService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
