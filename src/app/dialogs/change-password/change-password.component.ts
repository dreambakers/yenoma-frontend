import { Component, OnInit, ViewChild, Injector } from '@angular/core';
import { Validators, FormGroup, FormBuilder, NgForm } from '@angular/forms';
import { PasswordValidation } from 'src/app/helpers/password-validation';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  changePasswordForm: FormGroup;
  submitted = false;
  incorrectPassword = true;


  @ViewChild('f') form: NgForm;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ChangePasswordComponent>,
    private userService: UserService,
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
          // this.injector.get(UtilService).openSnackBar('messages.passwordChanged');
          this.onDismiss();
        } else {
          // this.injector.get(UtilService).openSnackBar('messages.errorChangingPassword', 'labels.retry');
        }
      },
      err => {
        if (err.error.incorrectPassword) {
          this.changePasswordForm.controls['password'].setErrors({'currentPasswordNotCorrect': true});
        } else {
          // this.injector.get(UtilService).openSnackBar('messages.errorChangingPassword', 'labels.retry');
        }
      }
    );
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

}

