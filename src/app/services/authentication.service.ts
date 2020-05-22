import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { constants } from '../app.constants';
import { UserService } from './user.service';
import { EmitterService } from './emitter.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private emitterService: EmitterService
  ) { }

  authenticateUser(email: string, password: string, signUp = false, remember = false) {
    let requestUrl = `${constants.apiUrl}/user`;

    if (signUp) {
      requestUrl += '/'
    }
    else {
      requestUrl += '/login'
    }

    return this.http.post(requestUrl, { email, password, remember }, {observe: 'response'});
  }

  logout() {
    this.http.post(`${constants.apiUrl}/user/logout`, {}).subscribe();
    this.userService.unsetLoggedInUser();
    this.emitterService.emit(constants.emitterKeys.logoutInitiated);
    this.router.navigateByUrl('login');
  }

  isAuthenticated() {
    return this.userService.getLoggedInUser() ? true : false;
  }

}
