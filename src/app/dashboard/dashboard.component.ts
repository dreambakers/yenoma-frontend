import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';
import { EmitterService } from '../services/emitter.service';
import { constants } from '../app.constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { UserIdleService } from 'angular-user-idle';
import { DialogService } from '../services/dialog.service';
import { AuthenticationService } from '../services/authentication.service';

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

  constructor(
    private translate: TranslateService,
    private userService: UserService,
    private emitterService: EmitterService,
    private userIdle: UserIdleService,
    private dialogService: DialogService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit() {
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

    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.logoutInitiated:
          for (const alert of this.globalAlerts) {
            this.userService.updatePreference({ [alert.key] : null });
          }
          return;
      }
    });
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

  ngOnDestroy(): void {
    this.emitterService.emit(this.constants.emitterKeys.resetNavbar);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  get isMobile() {
    return DataService.isMobile;
  }
}
