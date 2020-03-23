import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

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
