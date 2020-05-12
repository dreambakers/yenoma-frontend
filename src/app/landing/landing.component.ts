import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(private router: Router, public translate: TranslateService) { }

  ngOnInit() {
  }

  get activeLink() {
    return this.router.url;
  }

  get isViewingResponse() {
    return this.activeLink.includes('/p?');
  }

  get selectedIndex() {
    const isLoginSignup = this.router.url.includes('login') || this.router.url.includes('signup');
    return isLoginSignup ? 0 : 1;
  }

}
