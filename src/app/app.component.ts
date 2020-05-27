import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from './services/data.service';
import { EmitterService } from './services/emitter.service';
import { constants } from './app.constants';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Polling';
  selectedLanguage;
  constants = constants;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private emitterService: EmitterService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    DataService.isMobile = document.body.clientWidth <= DataService.mobileBreakpoint;
    this.selectedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    this.translate.use(this.selectedLanguage);
    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.languageChanged:
          return this.languageChanged(emitted.data);
      }
    });
  }

  languageChanged(event) {
    this.selectedLanguage = event.value;
    localStorage.setItem('selectedLanguage', this.selectedLanguage);
    this.translate.use(this.selectedLanguage);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    DataService.isMobile = event.target.innerWidth <= DataService.mobileBreakpoint;
    this.emitterService.emit(this.constants.emitterKeys.screeenSizeChanged, event.target.innerWidth);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
