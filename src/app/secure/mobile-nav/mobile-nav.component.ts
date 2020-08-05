import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { EmitterService } from '../../services/emitter.service';
import { Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';
import { takeUntil } from 'rxjs/operators';
import { DataService } from '../../services/data.service';
import { constants } from '../../app.constants';

export interface MobileNavbarProps {
  home?: Boolean;
  arrange?: Boolean;
  add?: Boolean;
  create?: Boolean;
  preview?: Boolean;
}

@Component({
  selector: 'app-mobile-nav',
  templateUrl: './mobile-nav.component.html',
  styleUrls: ['./mobile-nav.component.scss']
})
export class MobileNavComponent implements OnInit {

  contants = constants;
  navbarProps: MobileNavbarProps = {
    home: false,
    arrange: false,
    add: false,
    create: false,
    preview: false
  };
  labels = {
    home: 'labels.home',
    arrange: 'labels.arrange',
    add: 'labels.addSurvey',
    create: 'labels.create',
    preview: 'labels.preview'
  };
  labelsCopy = JSON.stringify(this.labels);
  keysToHighlight = {};
  selectedLanguage;
  languages;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private translate: TranslateService,
    private emitterService: EmitterService,
    private router: Router,
    private languageService: LanguageService) { }

  ngOnInit() {
    this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.updateNavbarProps:
          return this.navbarProps = { ...this.navbarProps, ...emitted.data };
        case constants.emitterKeys.resetNavbar:
          return this.reset();
        case constants.emitterKeys.updateNavbarLabels:
          return this.labels = { ...this.labels, ...emitted.data };
        case constants.emitterKeys.highlightKeys:
          return this.keysToHighlight = { ...this.keysToHighlight, ...emitted.data };
      }
    });
    this.languageService.getLanguages().subscribe(
      (res: any) => {
        this.languages = res.languages;
      }
    );
  }

  reset() {
    this.labels = JSON.parse(this.labelsCopy);
    this.keysToHighlight = {};
    Object.keys(this.navbarProps).forEach(key => {
      this.navbarProps[key] = false;
    });
  }

  languageChanged(event) {
    this.emitterService.emit(constants.emitterKeys.languageChanged, event);
  }

  isActive(key) {
    return this.navbarProps[key];
  }

  btnClick(key) {
    if (!this.shouldShowSort && ['preview', 'arrange'].includes(key) && this.isActive(key)) {
      this.keysToHighlight[key] = !this.keysToHighlight[key];
    }
    if (this.isActive(key)) {
      this.emitterService.emit(key);
    }
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

  get shouldShowSort() {
    return this.router.url.includes('all') || this.router.url.includes('responses');
  }

  get isMobile() {
    return DataService.isMobile;
  }

  get showMobileNav() {
    return this.isMobile && this.router.url.includes('/dashboard');
  }
}
