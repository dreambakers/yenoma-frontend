import { Component, OnInit } from '@angular/core';
import { constants } from 'src/app/app.constants';
import { UserService } from 'src/app/services/user.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  constants = constants;
  languages;
  selectedLanguage;
  user;

  constructor(
    private userService: UserService
  ) {
  }

  ngOnInit() {
    this.user = this.userService.getLoggedInUser();
  }

  get currentBreakpoint() {
    return DataService.currentBreakpoint;
  }

}
