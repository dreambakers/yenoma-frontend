import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { constants } from '../app.constants';
import { Subject } from 'rxjs';
import { EmitterService } from '../services/emitter.service';
import { DialogService } from '../services/dialog.service';
import { takeUntil } from 'rxjs/operators';
import { DataService } from '../services/data.service';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  constants = constants;
  @ViewChild('snav') sideNav;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private emitterService: EmitterService,
    private dialogService: DialogService,
    private authenticationService: AuthenticationService
    ) {}

  ngOnInit(): void {
    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.toggleSidebar:
          return this.sideNav.toggle();
        case constants.emitterKeys.changePasswordClicked:
          return this.changePassword();
        case constants.emitterKeys.aboutClicked:
          return this.about();
        case constants.emitterKeys.languageChangeClicked:
            return this.language();
      }
    });
  }

  logout() {
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

  toggleSidebar() {
    this.sideNav.toggle();
    return true;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  get showFooter() {
    return !this.authenticationService.isAuthenticated() || DataService.isMobile;
  }

  get hasMobileNav() {
    return this.authenticationService.isAuthenticated() && DataService.isMobile;
  }

}
