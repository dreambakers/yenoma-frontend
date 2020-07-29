import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';
import { UtilService } from 'src/app/services/util.service';
import { UserService } from 'src/app/services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { constants } from 'src/app/app.constants';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  forgotPasswordForm: FormGroup;
  submitted = false;
  constants = constants;
  @Output() emailSent:EventEmitter<Boolean> = new EventEmitter();

  constructor(
    private auth: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private utils: UtilService,
    private translate: TranslateService,
    private userService: UserService) { }

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/dashboard/all');
    }
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() { return this.forgotPasswordForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.forgotPasswordForm.invalid) {
      return;
    }
    this.userService.requestPasswordResetEmail(this.forgotPasswordForm.value.email).subscribe(
      (res: any) => {
        if (res.success) {
          this.emailSent.emit(true);
        } else {
          this.utils.openSnackBar('errors.e019_sendingEmail', 'labels.retry');
        }
    }, (errorResponse: any) => {
      this.utils.openSnackBar('errors.e019_sendingEmail', 'labels.retry');
    });
  }
}