import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UtilService } from '../../services/util.service';
import { UserService } from '../../services/user.service';
import { take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { constants } from 'src/app/app.constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  submitted = false;
  loading = false;
  constants = constants;
  @Output() loginEvent = new EventEmitter();
  @Output() forgotPasswordClicked = new EventEmitter();

  constructor(
    private auth: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private utils: UtilService,
    private userService: UserService,
    private translate: TranslateService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/dashboard/all');
    } else {
      this.route.queryParams.pipe(take(1)).subscribe(params => {
        const verificationToken = params['verificationToken'];
        if (verificationToken) {
          this.userService.verifySignup(verificationToken).subscribe(
            (res: any) => {
              if (res.success) {
                this.loginEvent.emit({ verified: true });
              } else {
                this.loginEvent.emit({ verified: false });
              }
            }, err => {
              this.loginEvent.emit({ verified: false });
            }
          )
        }
      });
    }
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberLogin: [ false ]
    });
  }

  get f() { return this.loginForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    const user = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
      username: this.loginForm.value.username
    }

    this.loading = true;
    this.auth.authenticateUser(user, false, this.loginForm.value.rememberLogin).subscribe((response: any) => {
      this.loading = false;
      if (response.headers.get('x-auth')) {
        const user = { ...response.body, authToken: response.headers.get('x-auth') };
        this.userService.updatePreference({ stayLoggedIn: this.loginForm.value.rememberLogin });
        this.userService.setLoggedInUser(user);
        this.router.navigateByUrl('/dashboard/all');
      } else if (response.body.notVerified) {
        this.loginEvent.emit({ verified: false, signedUp: true });
      } else {
        this.utils.openSnackBar('errors.e010_loggingIn', 'labels.retry');
      }
    }, (errorResponse: any) => {
      this.loading = false;
      const errorMessageKey = errorResponse.error.notFound ? 'messages.noUserFound' : 'errors.e010_loggingIn';
      this.utils.openSnackBar(errorMessageKey, 'labels.retry');
    });
  }

  forgotPassword() {
    this.forgotPasswordClicked.emit(true);
  }
}