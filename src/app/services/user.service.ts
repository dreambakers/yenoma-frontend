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

  updateProfile(profile) {
    return this.http.post(`${constants.apiUrl}/user/updateProfile/`, profile);
  }

  getProfile() {
    return this.http.get(`${constants.apiUrl}/user/getProfile/`);
  }

  verifySignup(verificationToken) {
    return this.http.post(`${constants.apiUrl}/user/verifySignup/`, { verificationToken });
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

  getPreferences() {
    return JSON.parse(localStorage.getItem('preferences'));
  }

  getPreference(preference) {
    const preferences = this.getPreferences();
    return preferences && preferences[preference];
  }

  updatePreference(preference) {
    let currentPreferences = { ...this.getPreferences(), ...preference };
    localStorage.setItem('preferences', JSON.stringify(currentPreferences));
  }

  unsetLoggedInUser() {
    localStorage.removeItem('user');
  }

  refreshToken() {
    return this.http.post(`${constants.apiUrl}/user/refreshToken/`, { });
  }
}
