import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {HttpClient, HttpClientModule} from '@angular/common/http';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// import ngx-translate and the http loader
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LOCATION_INITIALIZED } from '@angular/common';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ViewPollComponent } from './poll/view-poll/view-poll.component';
import { ViewPollsComponent } from './poll/view-polls/view-polls.component';
import { StarRatingComponent } from './star-rating/star-rating.component';
import { LoginComponent } from './landing/login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SignupComponent } from './landing/signup/signup.component';
import { RespondComponent } from './landing/respond/respond.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { LandingComponent } from './landing/landing.component';
import { ManagePollComponent } from './poll/manage-poll/manage-poll.component';
import { ViewStatsComponent } from './poll/view-stats/view-stats.component';
import { FooterComponent } from './footer/footer.component';
import { ResponsesComponent } from './poll/responses/responses.component';
import { ErrorComponent } from './error/error.component';
import { SortDialogComponent } from './dialogs/sort/sort-dialog.component';
import { ChangePasswordComponent } from './dialogs/change-password/change-password.component';
import { AboutComponent } from './dialogs/about/about.component';
import { LanguageComponent } from './dialogs/language/language.component';
import { AlertComponent } from './shared/alert/alert.component';

import { DigitOnlyModule } from '@uiowa/digit-only';

import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { NavbarComponent } from './navbar/navbar.component';
import { MatListModule } from '@angular/material/list';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RecordedComponent } from './landing/respond/recorded/recorded.component';

@NgModule({
  declarations: [
    AppComponent,
    ViewPollComponent,
    NavbarComponent,
    ViewPollsComponent,
    StarRatingComponent,
    LoginComponent,
    SignupComponent,
    DashboardComponent,
    ManagePollComponent,
    LandingComponent,
    RespondComponent,
    ConfirmDialogComponent,
    ViewStatsComponent,
    FooterComponent,
    ResponsesComponent,
    ErrorComponent,
    SortDialogComponent,
    ChangePasswordComponent,
    AboutComponent,
    LanguageComponent,
    AlertComponent,
    RecordedComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatInputModule,
    MatFormFieldModule,
    MatListModule,
    MatRadioModule,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    DragDropModule,
    MatTabsModule,
    MatDialogModule,
    MatTableModule,
    MatSortModule,
    MatMenuModule,
    MatSelectModule,
    MatSliderModule,
    MatCheckboxModule,
    MatCardModule,
    MatPaginatorModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    DigitOnlyModule,
    MatExpansionModule,
    MatSidenavModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [ConfirmDialogComponent]
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/');
}

export function appInitializerFactory(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>((resolve: any) => {
    const locationInitialized = injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
    locationInitialized.then(() => {
      const langToSet = 'en'
      translate.use(langToSet).subscribe(() => {
      }, err => {
        console.error(`Problem with '${langToSet}' language initialization.'`);
      }, () => {
        resolve(null);
      });
    });
  });
}