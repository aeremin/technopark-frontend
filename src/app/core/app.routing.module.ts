import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventionPageComponent } from '../invention-page/invention-page.component';
import { OverviewPageComponent } from '../overview-page/overview-page.component';
import { ScheduleDashboardComponent } from '../schedule-dashboard/schedule-dashboard.component';

const routes: Routes = [
  {path : '', component : OverviewPageComponent},
  {path : 'reservation', component : OverviewPageComponent},
  {path : 'invention', component : InventionPageComponent},
  {path : 'schedule', component : ScheduleDashboardComponent},
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule,
  ],
  declarations: [],
})
export class AppRoutingModule { }
