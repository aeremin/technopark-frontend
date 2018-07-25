import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { MatButtonModule, MatSelectModule, MatSortModule, MatTableModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from 'src/app/core/app.routing.module';
import { DataService } from 'src/services/data.service';
import { AppComponent } from './app.component';
import { OverviewPageComponent } from './overview-page/overview-page.component';

@NgModule({
  declarations: [
    AppComponent,
    OverviewPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpModule,
    HttpClientModule,
    MatButtonModule,
    MatSelectModule,
    MatSortModule,
    MatTableModule,
  ],
  providers: [
    DataService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
