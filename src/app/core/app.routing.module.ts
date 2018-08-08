import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CorpTopManagerGuardService } from '../../services/corp.topmanager.guard.service';
import { GameMasterGuardService } from '../../services/gamemaster.guard.service';
import { GamemasterGenericTableComponent } from '../gamemaster-generic-table/gamemaster-generic-table.component';
import { InventionPageComponent } from '../invention-page/invention-page.component';
import { LoginPageComponent } from '../login-page/login-page.component';
import { OverviewPageComponent } from '../overview-page/overview-page.component';
import { ScheduleDashboardComponent } from '../schedule-dashboard/schedule-dashboard.component';

const routes: Routes = [
  {path : '', component : LoginPageComponent},
  {path : 'overview', component : OverviewPageComponent},
  {path : 'invention', component : InventionPageComponent, canActivate: [CorpTopManagerGuardService]},
  {path : 'schedule', component : ScheduleDashboardComponent},
  {path : 'generic_table', component : GamemasterGenericTableComponent, canActivate: [GameMasterGuardService]},
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
