import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';
import { DataService } from '../services/data.service';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {
  signedUp = false;
  optionalTab = '';
  alert = '';

  constructor(
    private router: Router,
    public translate: TranslateService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      const sessionExpired = params['sessionExpired'];
      const passwordResetToken = params['passwordResetToken'];
      if (sessionExpired && sessionExpired === 'true') {
        this.alert = 'session-expired';
      } else if (passwordResetToken) {
        this.optionalTab = 'resetPassword';
      }
    });
  }

  onLoginEvent(event) {
    this.router.navigate(['login']);
    if (event.verified) {
      return this.alert = 'verification-success';
    }
    this.alert = 'verification-failure';
    this.signedUp = !!event.signedUp;
  }

  onEmailVerificationLinkClicked() {
    this.alert = '';
    this.optionalTab = 'emailVerification';
  }

  onEmailSent(emailType = 'signupVerification') {
    this.optionalTab = '';
    if (emailType === 'passwordReset') {
      return this.alert = 'password-reset-email-sent';
    }
    this.alert = 'verification';
  }

  onForgotPasswordClicked() {
    this.alert = '';
    this.optionalTab = 'forgotPassword';
  }

  onPasswordResetEvent(event) {
    this.router.navigate(['login']);
    this.optionalTab = '';
    if (event.success) {
      this.alert = 'password-changed';
    } else {
      this.alert = 'password-link-failure';
    }
  }

  onSignupEvent(event) {
    if (event.signupSuccess) {
      this.alert = 'verification';
    }
  }

  alertIs(bannerName) {
    return this.alert === bannerName;
  }

  get activeLink() {
    return this.router.url;
  }

  get isViewingResponse() {
    return this.activeLink.includes('/p/');
  }

  get selectedIndex() {
    const isLoginSignup = this.router.url.includes('login') || this.router.url.includes('signup');
    return isLoginSignup ? (this.optionalTab ? 2: 0) : 1;
  }

  get isMobile() {
    return DataService.isMobile;
  }

}
