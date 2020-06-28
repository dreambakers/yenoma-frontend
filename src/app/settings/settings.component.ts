import { Component, OnInit } from '@angular/core';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  user;
  loading = false;

  constructor(
    private userService: UserService,
    private utils: UtilService
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
  }

  get isMobile() {
    return DataService.isMobile;
  }

}
