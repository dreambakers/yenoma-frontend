import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { UserService } from '../services/user.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router,
              private userService: UserService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    request = request.clone({
      setHeaders: {
        'x-auth': this.userService.getAuthToken()
      }
    });
    return next.handle(request).pipe(tap(() => {},
      (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status !== 401) {
         return;
        }
        this.userService.unsetLoggedInUser();
        this.router.navigate(['login'], {
          queryParams: {
            sessionExpired: true
          },
          // skipLocationChange: true
        });
      }
    }));
  }
}
