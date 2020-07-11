import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { constants } from '../app.constants';
import { UserService } from './user.service';
import { EmitterService } from './emitter.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private emitterService: EmitterService,
    private translate: TranslateService
  ) { }

  authenticateUser(user: { email, password, username }, signUp = false, remember = false) {
    let requestUrl = `${constants.apiUrl}/user`;

    if (signUp) {
      requestUrl += '/'
    }
    else {
      requestUrl += '/login'
    }

    return this.http.post(requestUrl, { ...user, language: this.translate.currentLang }, {observe: 'response'});
  }

  logout(sessionExpired = false) {
    this.http.post(`${constants.apiUrl}/user/logout`, {}).subscribe();
    this.userService.unsetLoggedInUser();
    this.emitterService.emit(constants.emitterKeys.logoutInitiated);
    if (!sessionExpired) {
      this.router.navigateByUrl('login');
    } else {
      this.router.navigate(['login'], {
        queryParams: {
          sessionExpired: true
        },
        // skipLocationChange: true
      });
    }
  }

  isAuthenticated() {
    return this.userService.getLoggedInUser() ? true : false;
  }

}
