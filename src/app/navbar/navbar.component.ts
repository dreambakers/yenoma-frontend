import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { UtilService } from '../services/util.service';
import { TranslateService } from '@ngx-translate/core';
import { EmitterService } from '../services/emitter.service';
import { constants } from '../app.constants';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  constants = constants;
  user;
  show = false;
  currentPage = '';

  constructor(private auth: AuthenticationService,
              private userService: UserService,
              private utils: UtilService,
              public translate: TranslateService,
              private emitterService: EmitterService) { }

  ngOnInit() {
    this.user = this.userService.getLoggedInUser();
  }

  logout() {
    this.utils.confirmDialog('messages.areYouSure', 'messages.logout').subscribe(
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

}
