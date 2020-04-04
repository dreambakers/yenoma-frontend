import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { constants } from '../app.constants';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class PollService {

  constructor(private http: HttpClient, private userService: UserService) { }

  addPoll(poll) {
    return this.http.post(`${constants.apiUrl}/poll/`, { poll });
  }

  getPoll(pollId) {
    return this.http.get(`${constants.apiUrl}/poll/getPoll/${pollId}`);
  }

  managePoll(pollId) {
    return this.http.get(`${constants.apiUrl}/poll/manage/${pollId}`);
  }

  getPolls() {
    return this.http.get(`${constants.apiUrl}/poll/all`);
  }

  updatePoll(poll) {
    return this.http.post(`${constants.apiUrl}/poll/update`, { poll });
  }

  deletePoll(pollId) {
    return this.http.post(`${constants.apiUrl}/poll/delete/${pollId}`, {});
  }

  terminatePoll(pollId) {
    return this.http.post(`${constants.apiUrl}/poll/terminate/${pollId}`, {});
  }

  restore(pollId) {
    return this.http.post(`${constants.apiUrl}/poll/restore/${pollId}`, {});
  }

}
