import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PublicRoutingModule } from './public-routing.module';
import { LoginComponent } from './landing/login/login.component';
import { SignupComponent } from './landing/signup/signup.component';
import { LandingComponent } from './landing/landing.component';
import { RespondComponent } from './landing/respond/respond.component';
import { PasswordResetComponent } from './landing/password-reset/password-reset.component';
import { EmailVerificationComponent } from './landing/email-verification/email-verification.component';
import { ForgotPasswordComponent } from './landing/forgot-password/forgot-password.component';
import { RecordedComponent } from './landing/respond/recorded/recorded.component';
import { PublicComponent } from './public.component';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../material/material.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    LandingComponent,
    RespondComponent,
    PasswordResetComponent,
    EmailVerificationComponent,
    ForgotPasswordComponent,
    RecordedComponent,
    PublicComponent,
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    SharedModule
  ]
})
export class PublicModule { }
