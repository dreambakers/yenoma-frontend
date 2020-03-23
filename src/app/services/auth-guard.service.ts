import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(protected router: Router, private auth: AuthenticationService) { }

  canActivate() {
    if (!this.auth.isAuthenticated()) {
      this.router.navigateByUrl('login');
      return false;
    }
    return true;
  }

}