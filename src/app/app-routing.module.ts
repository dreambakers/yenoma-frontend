import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewPollComponent } from './poll/view-poll/view-poll.component';
import { ViewPollsComponent } from './poll/view-polls/view-polls.component';
import { LoginComponent } from './landing/login/login.component';
import { SignupComponent } from './landing/signup/signup.component';
import { AuthGuardService } from './services/auth-guard.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ManagePollComponent } from './poll/manage-poll/manage-poll.component';
import { LandingComponent } from './landing/landing.component';
import { RespondComponent } from './landing/respond/respond.component';
import { ViewStatsComponent } from './poll/view-stats/view-stats.component';
import { ResponsesComponent } from './poll/responses/responses.component';
import { ErrorComponent } from './error/error.component';

const routes: Routes = [

  {
    path: '', component: LandingComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full'},
      {
        path: 'signup', component: SignupComponent
      },
      {
        path: 'respond', component: RespondComponent
      },
      {
        path: 'view', redirectTo: 'p'
      },
      {
        path: 'p', component: ViewPollComponent
      },
      {
        path: 'login', component: LoginComponent
      },
      {
        path: 'response-recorded', component: RespondComponent
      },
    ]
  },
  {
    path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuardService],
    children: [
      { path: 'create', component: ManagePollComponent, pathMatch: 'full' },
      { path: 'all', component: ViewPollsComponent },
      { path: 'manage', component: ManagePollComponent },
      { path: 'view', component: ViewPollComponent },
      { path: 'stats', component: ViewStatsComponent },
      { path: 'responses', component: ResponsesComponent },
    ]
  },
  {
    path: '**', redirectTo: '404'
  },
  {
    path: '404', component: ErrorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
