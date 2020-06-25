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

  constructor(private router: Router,
              public translate: TranslateService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      const sessionExpired = params['sessionExpired'];
      if (sessionExpired && sessionExpired === 'true') {
        this.showSessionExpiredBanner = true;
      }
    });
  }

  get activeLink() {
    return this.router.url;
  }

  get isViewingResponse() {
    return this.activeLink.includes('/p/');
  }

  get selectedIndex() {
    const isLoginSignup = this.router.url.includes('login') || this.router.url.includes('signup');
    return isLoginSignup ? 0 : 1;
  }

}
