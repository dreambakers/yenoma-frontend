import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManagePollComponent } from './poll/manage-poll/manage-poll.component';
import { ViewPollsComponent } from './poll/view-polls/view-polls.component';
import { ViewPollComponent } from './poll/view-poll/view-poll.component';
import { ViewStatsComponent } from './poll/view-stats/view-stats.component';
import { ResponsesComponent } from './poll/responses/responses.component';
import { SettingsComponent } from './settings/settings.component';
import { AuthGuardService } from '../services/auth-guard.service';

const routes: Routes = [
  {
    path: '', component: DashboardComponent, canActivate: [AuthGuardService],
    children: [
      { path: 'create', component: ManagePollComponent, pathMatch: 'full' },
      { path: 'all', component: ViewPollsComponent },
      { path: 'manage', component: ManagePollComponent },
      { path: 'view', component: ViewPollComponent },
      { path: 'stats', component: ViewStatsComponent },
      { path: 'responses', component: ResponsesComponent },
      { path: 'settings', component: SettingsComponent },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecureRoutingModule { }
