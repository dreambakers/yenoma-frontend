import { Component, OnInit, ViewChild, EventEmitter, Output } from '@angular/core';
import { FormGroup, NgForm, FormBuilder, Validators } from '@angular/forms';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';
import { PasswordValidation } from 'src/app/helpers/password-validation';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { constants } from 'src/app/app.constants';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  changePasswordForm: FormGroup;
  submitted = false;
  passwordResetToken;
  constants = constants;
  @Output() passwordResetEvent = new EventEmitter();

  @ViewChild('f') form: NgForm;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private utils: UtilService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.changePasswordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPasswordConfirmation: ['', [Validators.required, Validators.minLength(6)]]
    },
    {
      validator: PasswordValidation.MatchNewPassword
    });

    this.route.queryParams.pipe(take(1)).subscribe(params => {
      this.passwordResetToken = params.passwordResetToken;
      this.userService.verifyPasswordResetToken(this.passwordResetToken).pipe(take(1)).subscribe(
        (res: any) => {
          if (!res.success) {
            this.passwordResetEvent.emit({ notValid: true });
          }
        },
        err => {
          this.passwordResetEvent.emit({ notValid: true });
        }
      );
    });
  }

  get f() { return this.changePasswordForm.controls; }

  onChangePassword() {
    this.submitted = true;

    if (this.changePasswordForm.invalid) {
      return;
    }

    this.userService.resetPassword(
      this.changePasswordForm.value.newPassword,
      this.passwordResetToken
    ).subscribe(
      (res: any) => {
        if (res.success) {
          this.passwordResetEvent.emit({ success: true });
        } else {
          this.utils.openSnackBar('errors.e015_changingPassword', 'labels.retry');
        }
      },
      err => {
        this.utils.openSnackBar('errors.e015_changingPassword', 'labels.retry');
      }
    );
  }
}