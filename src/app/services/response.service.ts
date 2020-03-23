import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { constants } from '../app.constants';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ResponseService {

  constructor(private http: HttpClient, private userService: UserService) { }

  recordResponse(response) {
    return this.http.post(`${constants.apiUrl}/response/`, { response });
  }

  updateResponse(response) {
    return this.http.post(`${constants.apiUrl}/response/update`, { response });
  }

}
