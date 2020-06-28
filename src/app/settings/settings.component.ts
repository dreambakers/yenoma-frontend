import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';
import { UtilService } from '../services/util.service';
import { EmitterService } from '../services/emitter.service';
import { constants } from '../app.constants';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  user;
  loading = false;
  constants = constants;

  constructor(
    private userService: UserService,
    private utils: UtilService,
    private emitterService: EmitterService
  ) { }

  ngOnInit(): void {
    this.loading = true;
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

  get isMobile() {
    return DataService.isMobile;
  }

  get currentBreakpoint() {
    return DataService.currentBreakpoint;
  }

}
