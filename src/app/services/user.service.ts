import { Injectable } from '@angular/core';
import { constants } from '../app.constants';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private http: HttpClient
  ) { }

  changePassword(oldPassword, newPassword) {
    return this.http.post(`${constants.apiUrl}/user/changePassword/`, { oldPassword, newPassword });
  }

  getLoggedInUser() {
    return JSON.parse(localStorage.getItem('user'));
  }

  getAuthToken() {
    return (this.getLoggedInUser() && this.getLoggedInUser()['authToken']) || '';
  }

  setLoggedInUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  unsetLoggedInUser() {
    localStorage.removeItem('user');
  }
}
