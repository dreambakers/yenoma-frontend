import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  showSessionExpiredBanner = false;
  showVerificationBanner = false;
  showVerificationSuccessBanner = false;
  showVerificationFailureBanner = false;
  showPasswordLinkFailureBanner = false;
  showPasswordChangedBanner = false;
  signedUp = false;

  optionalTab = '';

  constructor(
    private router: Router,
    public translate: TranslateService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      const sessionExpired = params['sessionExpired'];
      const signupSuccessful = params['signupSuccessful'];
      const passwordResetToken = params['passwordResetToken'];
      if (sessionExpired && sessionExpired === 'true') {
        this.showSessionExpiredBanner = true;
      } else if (signupSuccessful && signupSuccessful === 'true') {
        this.showVerificationBanner = true;
      } else if (passwordResetToken) {
        this.optionalTab = 'resetPassword';
      }
    });
  }

  onAccountVerficationEvent(event) {
    this.router.navigate(['login']);
    if (event.verified) {
      return this.showVerificationSuccessBanner = true;
    }
    this.showVerificationFailureBanner = true;
    this.signedUp = !!event.signedUp;
  }

  onEmailVerificationLinkClicked() {
    this.showVerificationFailureBanner = false;
    this.optionalTab = 'emailVerification';
  }

  onEmailSent() {
    this.optionalTab = '';
    this.showVerificationBanner = true;
  }

  onForgotPasswordClicked() {
    this.optionalTab = 'forgotPassword';
  }

  onPasswordResetEvent(event) {
    this.optionalTab = '';
    if (event.success) {
      this.showPasswordChangedBanner = true;
    } else {
      this.showPasswordLinkFailureBanner = true;
    }
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

}
