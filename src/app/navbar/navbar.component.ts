import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { UtilService } from '../services/util.service';
import { TranslateService } from '@ngx-translate/core';
import { EmitterService } from '../services/emitter.service';
import { constants } from '../app.constants';
import { DataService } from '../services/data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DialogService } from '../services/dialog.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  constants = constants;
  user;
  show = false;
  currentPage: any = {};
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private auth: AuthenticationService,
    private userService: UserService,
    private utils: UtilService,
    public translate: TranslateService,
    private emitterService: EmitterService,
    private dialogService: DialogService,
    private router: Router
  ) { }

  ngOnInit() {
    this.user = this.userService.getLoggedInUser();

    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.changeNavbarTitle:
          return this.currentPage = { ...this.currentPage, ...emitted.data };
        case constants.emitterKeys.logoutClicked:
          return this.logout();
        case constants.emitterKeys.resetNavbar:
          return this.reset();
      }
    });

  }

  reset() {
    this.currentPage = {};
  }

  logout() {
    this.dialogService.confirm('messages.areYouSure', 'messages.logout').subscribe(
      res => {
        if (res) {
          this.auth.logout();
        }
      }
    );
  }

  toggleSidebar(){
    this.emitterService.emit(this.constants.emitterKeys.toggleSidebar);
  }

  get isMobile() {
    return DataService.isMobile;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  about() {
    this.emitterService.emit(this.constants.emitterKeys.aboutClicked);
  }

  cookiePolicy() {
    this.emitterService.emit(this.constants.emitterKeys.cookiePolicyClicked);
  }

  imprint() {
    this.emitterService.emit(this.constants.emitterKeys.imprintClicked);
  }

  termsAndConditions() {
    this.emitterService.emit(this.constants.emitterKeys.termsAndConditionsClicked);
  }

  feedback() {
    this.emitterService.emit(this.constants.emitterKeys.feedbackClicked);
  }

  importSurvey() {
    this.emitterService.emit(this.constants.emitterKeys.importSurveryClicked);
  }

  settings() {
    this.router.navigate(['dashboard/settings']);
  }

}
