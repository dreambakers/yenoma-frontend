import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SecureRoutingModule } from './secure-routing.module';

import { NavbarComponent } from './navbar/navbar.component';
import { ViewPollsComponent } from './poll/view-polls/view-polls.component';
import { ManagePollComponent } from './poll/manage-poll/manage-poll.component';
import { ViewStatsComponent } from './poll/view-stats/view-stats.component';
import { SortDialogComponent } from '../dialogs/sort/sort-dialog.component';
import { ShareComponent } from '../dialogs/share/share.component';
import { InactivityComponent } from '../dialogs/inactivity/inactivity.component';
import { SettingsComponent } from './settings/settings.component';
import { ProfileComponent } from './settings/profile/profile.component';
import { GeneralComponent } from './settings/general/general.component';
import { SecurityComponent } from './settings/security/security.component';
import { FeedbackComponent } from '../dialogs/feedback/feedback.component';
import { MobileNavComponent } from './mobile-nav/mobile-nav.component';
import { UpgradeComponent } from '../dialogs/upgrade/upgrade.component';
import { NewOrderComponent } from './settings/new-order/new-order.component';
import { ImportSurveyComponent } from '../dialogs/import-survey/import-survey.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SharedModule } from '../shared/shared.module';
import { ResponsesComponent } from './poll/responses/responses.component';
import { ViewPollComponent } from './poll/view-poll/view-poll.component';

@NgModule({
  declarations: [
    NavbarComponent,
    ViewPollsComponent,
    DashboardComponent,
    ManagePollComponent,
    ViewStatsComponent,
    SortDialogComponent,
    ShareComponent,
    InactivityComponent,
    SettingsComponent,
    ProfileComponent,
    GeneralComponent,
    SecurityComponent,
    FeedbackComponent,
    MobileNavComponent,
    UpgradeComponent,
    NewOrderComponent,
    ImportSurveyComponent,
    ResponsesComponent,
    ViewPollComponent,
  ],
  imports: [
    CommonModule,
    SecureRoutingModule,
    SharedModule,
  ]
})
export class SecureModule { }