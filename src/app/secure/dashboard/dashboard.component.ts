import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../../services/data.service';
import { UserService } from '../../services/user.service';
import { EmitterService } from '../../services/emitter.service';
import { constants } from '../../app.constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserIdleService } from 'angular-user-idle';
import { DialogService } from '../../services/dialog.service';
import { AuthenticationService } from '../../services/authentication.service';
import { ScrollService } from '../../services/scroll.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constants = constants;
  globalAlerts = [
    {
      key: 'questionerWarning',
      type: 'danger',
      messageKey: 'globalMessages.questionerWarning'
    },
    {
      key: 'questionerHint',
      type: 'info',
      messageKey: 'globalMessages.questionerHint'
    }
  ];
  destroy$: Subject<boolean> = new Subject<boolean>();
  inActivityDialogOpened = false;
  @ViewChild('snav') sideNav;
  scrollPosition = 0;

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private emitterService: EmitterService,
    private userIdle: UserIdleService,
    private dialogService: DialogService,
    private authenticationService: AuthenticationService,
    private scrollService: ScrollService,
    private changeDetector: ChangeDetectorRef
  ) { }

  ngOnInit() {
    if (!!!this.userService.getPreference('stayLoggedIn')) {
      this.userIdle.startWatching();
      this.userIdle.onTimerStart().pipe(takeUntil(this.destroy$)).subscribe((count) => {
        this.emitterService.emit(this.constants.emitterKeys.idleTimeoutCount, count);
        if (!this.inActivityDialogOpened) {
          this.inActivityDialogOpened = true;
          this.dialogService.inactivity().subscribe(
            res => {
              if (!res || !res.logout) {
                this.userService.refreshToken().subscribe();
              }
              this.userIdle.stopTimer();
              this.inActivityDialogOpened = false;
            }
          );
        }
      });

      this.userIdle.onTimeout().pipe(takeUntil(this.destroy$)).subscribe(() => {
        this.emitterService.emit(this.constants.emitterKeys.idleTimedOut);
        this.authenticationService.logout(true);
      });
    }

    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.logoutInitiated:
          for (const alert of this.globalAlerts) {
            this.userService.updatePreference({ [alert.key] : null });
          }
          return;
        case constants.emitterKeys.toggleSidebar:
          return this.sideNav.toggle();
        case constants.emitterKeys.feedbackClicked:
          return this.feedback();
        case constants.emitterKeys.importSurveryClicked:
            return this.importSurvey();
        case constants.emitterKeys.scrollPositionUpdated:
          return this.scrollPosition = emitted.data;
      }
    });
  }

  ngAfterViewChecked(): void {
    this.changeDetector.detectChanges();
  }

  showGlobalAlert(messageKey) {
    if (!this.userService.getPreference(messageKey)) {
      const message = this.translate.instant(`globalMessages.${messageKey}`);
      return message && message !== `globalMessages.${messageKey}`;
    }
    return false;
  }

  globalAlertDismissed(key) {
    this.userService.updatePreference(
      { [key]: true }
    );
  }

  logout() {
    this.emitterService.emit(this.constants.emitterKeys.logoutClicked);
  }

  about() {
    this.emitterService.emit(constants.emitterKeys.aboutClicked);
  }

  cookiePolicy() {
    this.emitterService.emit(constants.emitterKeys.cookiePolicyClicked);
  }

  imprint() {
    this.emitterService.emit(constants.emitterKeys.imprintClicked);
  }

  termsAndConditions() {
    this.emitterService.emit(constants.emitterKeys.termsAndConditionsClicked);
  }

  feedback() {
    this.dialogService.feedback();
  }

  importSurvey() {
    this.dialogService.importSurvey();
  }

  toggleSidebar() {
    this.sideNav.toggle();
    return true;
  }

  onScroll(event) {
    this.scrollService.updateCurrent(event.srcElement.scrollTop);
  }

  get hasMobileNav() {
    return this.authenticationService.isAuthenticated() && DataService.isMobile;
  }

  get isMobile() {
    return DataService.isMobile;
  }

  ngOnDestroy(): void {
    this.emitterService.emit(this.constants.emitterKeys.resetNavbar);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


}
