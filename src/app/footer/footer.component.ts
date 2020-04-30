import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../services/data.service';
import { EmitterService } from '../services/emitter.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { constants } from '../app.constants';

export interface MobileNavbarProps {
  cancel: Boolean;
  arrange: Boolean;
  add: Boolean;
  create: Boolean;
  preview: Boolean;
}

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  navbarProps: MobileNavbarProps = {
    cancel: false,
    arrange: false,
    add: false,
    create: false,
    preview: false
  }
  selectedLanguage;
  languages = [
    { display: "English", value: "en" },
    { display: "German", value: "de" },
    { display: "French", value: "fr" }
  ];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private translate: TranslateService, private emitterService: EmitterService) { }

  ngOnInit() {
    this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.translate.use(this.selectedLanguage);
    this.emitterService.emittter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      if (emitted.event === constants.emitterKeys.updateNavbarProps) {
        this.navbarProps = emitted.data;
      }
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
    if (this.isActive(key)) {
      this.emitterService.emit(key);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  get isMobile() {
    return DataService.isMobile;
  }
}
