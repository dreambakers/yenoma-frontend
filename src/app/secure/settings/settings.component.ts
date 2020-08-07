import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { UserService } from '../../services/user.service';
import { UtilService } from '../../services/util.service';
import { EmitterService } from '../../services/emitter.service';
import { constants } from '../../app.constants';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  user;
  loading = false;
  selectedTabIndex = 0;
  constants = constants;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private userService: UserService,
    private utils: UtilService,
    private emitterService: EmitterService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.emitterService.emit(constants.emitterKeys.updateNavbarProps, { home: true });
    this.loading = true;
    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.home:
          return this.router.navigate(['dashboard/all']);
      }
    });
    this.userService.getProfile().subscribe(
      (res: any) => {
        if (res.success) {
          this.user = res.user;
          this.loading = false;
        } else {
          this.loading = false;
          this.utils.openSnackBar('errors.e017_gettingProfile');
        }
      },
      err => {
        this.loading = false;
        this.utils.openSnackBar('errors.e017_gettingProfile');
      }
    );
    this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, {
      key: 'labels.settings',
    });
  }

  setSelectedTabIndex(event) {
    this.selectedTabIndex = event;
    let selectedTab;
    switch(this.selectedTabIndex) {
      case 0:
        selectedTab = 'profile';
        break;
      case 1:
        selectedTab = 'security';
        break;
      case 2:
        selectedTab = 'locale';
        break;
      case 3:
        selectedTab = 'newOrder';
        break;
    }
    this.emitterService.emit(constants.emitterKeys.settingsTabChanged, selectedTab);
  }

  get isMobile() {
    return DataService.isMobile;
  }

  get currentBreakpoint() {
    return DataService.currentBreakpoint;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.emitterService.emit(this.constants.emitterKeys.resetNavbar);
  }

}
