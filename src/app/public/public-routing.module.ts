import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LandingComponent } from './landing/landing.component';
import { SignupComponent } from './landing/signup/signup.component';
import { RespondComponent } from './landing/respond/respond.component';
import { LoginComponent } from './landing/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full'},
      { path: 'login', component: LoginComponent },
      {
        path: 'signup', component: SignupComponent
      },
      {
        path: 'respond', component: RespondComponent
      },
      {
        path: 'view', redirectTo: 'p'
      },
      // {
      //   path: 'p/:id', component: ViewPollComponent
      // },
      {
        path: 'login', component: LoginComponent
      },
      {
        path: 'response-recorded', component: RespondComponent
      },
      {
        path: 'verify', redirectTo: 'login'
      },
      {
        path: 'password-reset', redirectTo: 'login'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
