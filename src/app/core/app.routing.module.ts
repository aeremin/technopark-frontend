import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InventionPageComponent } from '../invention-page/invention-page.component';
import { OverviewPageComponent } from '../overview-page/overview-page.component';

const routes: Routes = [
  {path : '', component : OverviewPageComponent},
  {path : 'reservation', component : OverviewPageComponent},
  {path : 'invention', component : InventionPageComponent},
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
