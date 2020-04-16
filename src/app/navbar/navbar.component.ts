import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { UtilService } from '../services/util.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  user;
  show = false;

  constructor(private auth: AuthenticationService,
              private userService: UserService,
              private utils: UtilService,
              public translate: TranslateService) { }

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

}
