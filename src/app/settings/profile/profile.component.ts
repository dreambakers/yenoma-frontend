import { Component, OnInit, Input } from '@angular/core';
import { constants } from 'src/app/app.constants';
import { UserService } from 'src/app/services/user.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UtilService } from 'src/app/services/util.service';
import { DataService } from 'src/app/services/data.service';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { takeUntil } from 'rxjs/operators';
import { EmitterService } from 'src/app/services/emitter.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  @Input() user;
  selectedLanguage;
  constants = constants;

  subscription;
  submitted = false;
  profileForm: FormGroup;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private formBuilder: FormBuilder,
    private utils: UtilService,
    private userService: UserService,
    private translate: TranslateService,
    private emitterService: EmitterService
  ) { }

  ngOnInit() {
    this.profileForm = this.formBuilder.group({
      username: [this.user?.username, [Validators.required, Validators.pattern('^[a-zA-Z0-9]+$'), Validators.minLength(5)]],
      email: [this.user?.email, [Validators.required, Validators.email]],
    });
    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.subscriptionPaymentSuccessful:
          this.getSubscription(true);
      }
    });
    this.getSubscription();
  }

  getSubscription(updateUser = false) {
    this.userService.getSubscription().subscribe(
      (res: any) => {
        if (res.success) {
          this.subscription = res.subscription;
          if (updateUser) {
            this.user.subscription = this.subscription;
            this.userService.updateUser(this.user);
          }
        }
      }
    );
  }

  getSubscriptionLevel() {
    if (this.subscription) {
      const key = this.subscription.isPro ? 'subscriptions.pro' : 'subscriptions.standard';
      return this.translate.instant(key, { ED: this.getParsedDate(this.subscription.expires) });
    }
    return this.translate.instant('labels.loading');
  }

  get f() { return this.profileForm.controls; }

  getParsedDate(date) {
    if (date) {
      return moment(date).format('YYYY-MM-DD');
    } else {
      return '-';
    }
  }

  onSubmit() {
    this.submitted = true;

    if (this.profileForm.invalid) {
      return;
    }

    const user = {
      email: this.profileForm.value.email,
      username: this.profileForm.value.username
    }

    this.userService.updateProfile(user).subscribe(
      (res: any) => {
        if (res.success) {
          this.utils.openSnackBar('messages.profileUpdated');
        } else {
          this.utils.openSnackBar('errors.e018_updatingProfile', 'labels.retry');
        }
      },
      errorResponse => {
        if (errorResponse.error.alreadyExists) {
          if (errorResponse.error.username) {
            this.profileForm.controls['username'].setErrors({'usernameExists': true});
          }
          if (errorResponse.error.email) {
            this.profileForm.controls['email'].setErrors({'emailExists': true});
          }
          return;
        }
        this.utils.openSnackBar('errors.e018_updatingProfile', 'labels.retry');
      }
    );
  }

  get currentBreakpoint() {
    return DataService.currentBreakpoint;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }
}
