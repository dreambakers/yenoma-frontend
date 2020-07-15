import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FormGroup, NgForm, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';
import { PasswordValidation } from 'src/app/helpers/password-validation';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {

  @Input() user;
  changePasswordForm: FormGroup;
  submitted = false;
  incorrectPassword = true;
  hide = true;


  @ViewChild('f') form: NgForm;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private utils: UtilService
  ) { }

  ngOnInit(): void {
    this.changePasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      newPasswordConfirmation: ['', [Validators.required, Validators.minLength(6)]]
    },
    {
      validator: PasswordValidation.MatchNewPassword
    });
  }

  get f() { return this.changePasswordForm.controls; }

  onChangePassword() {
    this.submitted = true;

    if (this.changePasswordForm.invalid) {
      return;
    }

    this.userService.changePassword(
      this.changePasswordForm.value.password,
      this.changePasswordForm.value.newPassword
    ).subscribe(
      (res: any) => {
        if (res.success) {
          this.utils.openSnackBar('messages.passwordChanged');
        } else {
          this.utils.openSnackBar('errors.e015_changingPassword', 'labels.retry');
        }
      },
      err => {
        if (err.error.incorrectPassword) {
          this.changePasswordForm.controls['password'].setErrors({'currentPasswordNotCorrect': true});
        } else {
          this.utils.openSnackBar('errors.e015_changingPassword', 'labels.retry');
        }
      }
    );
  }

  get currentBreakpoint() {
    return DataService.currentBreakpoint;
  }
}