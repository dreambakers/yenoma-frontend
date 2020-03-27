import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { UserService } from '../services/user.service';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  user;
  show = false;

  constructor(private auth: AuthenticationService, private userService: UserService, private utils: UtilService) { }

  ngOnInit() {
    this.user = this.userService.getLoggedInUser();
  }

  logout() {
    this.utils.confirmDialog('Are you sure?', 'You will be logged out').subscribe(
      res => {
        if (res) {
          this.auth.logout();
        }
      }
    );
  }

}
