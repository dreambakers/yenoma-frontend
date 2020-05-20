import { Component, HostListener, OnInit, ViewChild, ElementRef } from '@angular/core';
import { DataService } from './services/data.service';
import { Subject } from 'rxjs';
import { EmitterService } from './services/emitter.service';
import { takeUntil } from 'rxjs/operators';
import { constants } from './app.constants';
import { UtilService } from './services/util.service';
import { DialogService } from './services/dialog.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Polling';
  constants = constants;
  fillerNav = Array.from({length: 50}, (_, i) => `Nav Item ${i + 1}`);
  @ViewChild('snav') sideNav;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private emitterService: EmitterService,
    private utils: UtilService,
    private dialogService: DialogService
    ) {}

  ngOnInit(): void {
    DataService.isMobile = document.body.clientWidth <= DataService.mobileBreakpoint;
    this.emitterService.emittter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.toggleSidebar:
          return this.sideNav.toggle();
        case constants.emitterKeys.changePasswordClicked:
          return this.changePassword();
        case constants.emitterKeys.aboutClicked:
          return this.about();
      }
    });
  }

  convertLabelsFromTo(fromObj, toLang) {
    let temp = JSON.parse(JSON.stringify(fromObj));
    Object.keys(temp).forEach(key => {
      Object.keys(temp[key]).forEach(innerKey => { temp[key][innerKey] = temp[key][innerKey] + `_${toLang}` })
    });
    console.log(JSON.stringify(temp));
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    DataService.isMobile = event.target.innerWidth <= DataService.mobileBreakpoint;
    this.emitterService.emit(this.constants.emitterKeys.screeenSizeChanged, event.target.innerWidth);
  }

  logout() {
    this.toggleSidebar();
    this.emitterService.emit(this.constants.emitterKeys.logoutClicked);
  }

  changePassword() {
    this.dialogService.changePassword();
  }

  about() {
    this.dialogService.about();
  }

  language() {
    this.dialogService.language();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  toggleSidebar() {
    this.sideNav.toggle();
    return true;
  }

}
