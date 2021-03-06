import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { UserIdleService } from 'angular-user-idle';
import { EmitterService } from 'src/app/services/emitter.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { constants } from 'src/app/app.constants';
import { AuthenticationService } from 'src/app/services/authentication.service';
import * as moment from 'moment';

@Component({
  selector: 'app-inactivity',
  templateUrl: './inactivity.component.html',
  styleUrls: ['./inactivity.component.scss']
})
export class InactivityComponent implements OnInit {

  interval;
  constants = constants;
  remaining;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    public dialogRef: MatDialogRef<InactivityComponent>,
    private userIdle: UserIdleService,
    private emitterService: EmitterService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit(): void {
    const start = moment(`00:${this.constants.idleTimouts.timeout}`, "mm:ss");
    let seconds = start.minutes() * 60;
    this.interval = setInterval(() => {
      this.remaining = start.subtract(1, "second").format("mm:ss");
      seconds--;
      if (seconds === 0) clearInterval(this.interval);
    }, 1000);

    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.idleTimedOut:
          this.dialogRef.close({ logout: true });
      }
    });
  }

  onCancelTimeout(): void {
    this.dialogRef.close();
  }

  onLogout(): void {
    this.authenticationService.logout();
    this.dialogRef.close({ logout: true });
    this.userIdle.stopTimer();
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
