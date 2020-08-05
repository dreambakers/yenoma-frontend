import { NgModule, ModuleWithProviders, Injector } from '@angular/core';
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertComponent } from './alert/alert.component';
import { StarRatingComponent } from './star-rating/star-rating.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { FooterComponent } from '../footer/footer.component';
import { ErrorComponent } from '../error/error.component';
import { AboutComponent } from '../dialogs/about/about.component';
import { CookiePolicyComponent } from '../dialogs/cookie-policy/cookie-policy.component';
import { ImprintComponent } from '../dialogs/imprint/imprint.component';
import { TermsAndConditionsComponent } from '../dialogs/terms-and-conditions/terms-and-conditions.component';
import { SnackbarComponent } from './snackbar/snackbar.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    StarRatingComponent,
    ConfirmDialogComponent,
    FooterComponent,
    AlertComponent,
    ErrorComponent,
    AboutComponent,
    CookiePolicyComponent,
    ImprintComponent,
    TermsAndConditionsComponent,
    SnackbarComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    CommonModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      },
      extend: true
    }),
    RouterModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    MaterialModule,
    StarRatingComponent,
    ConfirmDialogComponent,
    FooterComponent,
    AlertComponent,
    ErrorComponent,
    AboutComponent,
    CookiePolicyComponent,
    ImprintComponent,
    TermsAndConditionsComponent,
    SnackbarComponent,
    RouterModule
  ],
})
export class SharedModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '.../../assets/i18n/');
}