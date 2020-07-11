import { Component, OnInit, ViewChild, HostListener, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { constants } from '../app.constants';
import { Subject } from 'rxjs';
import { EmitterService } from '../services/emitter.service';
import { DialogService } from '../services/dialog.service';
import { takeUntil } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { AuthenticationService } from '../services/authentication.service';
import { ScrollService } from '../services/scroll.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constants = constants;
  @ViewChild('snav') sideNav;

  destroy$: Subject<boolean> = new Subject<boolean>();
  scrollPosition = 0;

  constructor(
    private emitterService: EmitterService,
    private dialogService: DialogService,
    private authenticationService: AuthenticationService,
    private scrollService: ScrollService,
    private changeDetector : ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.toggleSidebar:
          return this.sideNav.toggle();
        case constants.emitterKeys.aboutClicked:
          return this.about();
        case constants.emitterKeys.cookiePolicyClicked:
            return this.cookiePolicy();
        case constants.emitterKeys.imprintClicked:
            return this.imprint();
        case constants.emitterKeys.termsAndConditionsClicked:
            return this.termsAndConditions();
        case constants.emitterKeys.feedbackClicked:
          return this.feedback();
        case constants.emitterKeys.scrollPositionUpdated:
          return this.scrollPosition = emitted.data;
      }
    });
  }

  ngAfterViewChecked(): void {
    this.changeDetector.detectChanges();
  }

  logout() {
    this.emitterService.emit(this.constants.emitterKeys.logoutClicked);
  }

  about() {
    this.dialogService.about();
  }

  cookiePolicy() {
    this.dialogService.cookiePolicy();
  }

  imprint() {
    this.dialogService.imprint();
  }

  termsAndConditions() {
    this.dialogService.termsAndConditions();
  }

  feedback() {
    this.dialogService.feedback();
  }

  toggleSidebar() {
    this.sideNav.toggle();
    return true;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }


  get hasMobileNav() {
    return this.authenticationService.isAuthenticated() && DataService.isMobile;
  }

  onScroll(event) {
    this.scrollService.updateCurrent(event.srcElement.scrollTop);
  }

}
