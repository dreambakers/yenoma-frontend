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
  showEmailVerificationTab = false;
  showPasswordResetTab = false;
  signedUp = false;

  constructor(private router: Router,
              public translate: TranslateService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      const sessionExpired = params['sessionExpired'];
      const signupSuccessful = params['signupSuccessful'];
      if (sessionExpired && sessionExpired === 'true') {
        this.showSessionExpiredBanner = true;
      } else if (signupSuccessful && signupSuccessful === 'true') {
        this.showVerificationBanner = true;
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

  onEmailVerificationLinkClicked(event) {
    this.showVerificationFailureBanner = false;
    this.showEmailVerificationTab = true;
  }

  onEmailSent() {
    this.showEmailVerificationTab = false;
    this.showVerificationBanner = true;
  }

  get activeLink() {
    return this.router.url;
  }

  get isViewingResponse() {
    return this.activeLink.includes('/p/');
  }

  get selectedIndex() {
    const isLoginSignup = this.router.url.includes('login') || this.router.url.includes('signup');
    return isLoginSignup ? (this.showEmailVerificationTab ? 2:  0) : 1;
  }

}
