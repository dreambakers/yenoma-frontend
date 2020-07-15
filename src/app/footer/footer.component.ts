import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../services/data.service';
import { EmitterService } from '../services/emitter.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { constants } from '../app.constants';
import { Router } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  contants = constants;
  selectedLanguage;
  languages;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private translate: TranslateService,
    private emitterService: EmitterService,
    private router: Router,
    private languageService: LanguageService,
    private authenticationService: AuthenticationService
  ) { }

  ngOnInit() {
    this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.languageService.getLanguages().subscribe(
      (res: any) => {
        this.languages = res.languages;
      }
    );
  }

  languageChanged(event) {
    this.emitterService.emit(constants.emitterKeys.languageChanged, event);
  }

  about() {
    this.emitterService.emit(constants.emitterKeys.aboutClicked);
  }

  cookiePolicy() {
    this.emitterService.emit(constants.emitterKeys.cookiePolicyClicked);
  }

  imprint() {
    this.emitterService.emit(constants.emitterKeys.imprintClicked);
  }

  termsAndConditions() {
    this.emitterService.emit(constants.emitterKeys.termsAndConditionsClicked);
  }

  feedback() {
    this.emitterService.emit(constants.emitterKeys.feedbackClicked);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  get isLoggedIn() {
    return this.authenticationService.isAuthenticated();
  }

  get isMobile() {
    return DataService.isMobile;
  }

  get showMobileNav() {
    return this.isMobile && this.router.url.includes('/dashboard');
  }
}
