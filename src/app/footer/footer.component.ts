import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../services/data.service';
import { EmitterService } from '../services/emitter.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { constants } from '../app.constants';
import { Router } from '@angular/router';

export interface MobileNavbarProps {
  cancel?: Boolean;
  arrange?: Boolean;
  add?: Boolean;
  create?: Boolean;
  preview?: Boolean;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  contants = constants;
  navbarProps: MobileNavbarProps = {
    cancel: false,
    arrange: false,
    add: false,
    create: false,
    preview: false
  }
  keysToHighlight = {};
  selectedLanguage;
  languages = this.contants.languages;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private translate: TranslateService,
    private emitterService: EmitterService,
    private router: Router) { }

  ngOnInit() {
    this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.translate.use(this.selectedLanguage);
    this.emitterService.emittter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.updateNavbarProps:
          return this.navbarProps = { ...this.navbarProps, ...emitted.data };
        case constants.emitterKeys.resetNavbar:
          return this.reset();
      }
    });
  }

  reset() {
    this.keysToHighlight = {};
    Object.keys(this.navbarProps).forEach(key => {
      this.navbarProps[key] = false;
    });
  }

  languageChanged(event) {
    this.selectedLanguage = event.value;
    localStorage.setItem('selectedLanguage', this.selectedLanguage);
    this.translate.use(this.selectedLanguage);
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
