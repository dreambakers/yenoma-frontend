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
    return this.http.post(`${constants.apiUrl}/survey/`, { poll });
  }

  getPoll(pollId, password = null) {
    return this.http.post(`${constants.apiUrl}/survey/getSurvey/${pollId}`, { password });
  }

  managePoll(pollId) {
    return this.http.get(`${constants.apiUrl}/survey/manage/${pollId}`);
  }

  getPolls() {
    return this.http.get(`${constants.apiUrl}/survey/all`);
  }

  updatePoll(poll) {
    return this.http.post(`${constants.apiUrl}/survey/update`, { poll });
  }

  deletePoll(pollId) {
    return this.http.post(`${constants.apiUrl}/survey/delete/${pollId}`, {});
  }

  terminatePoll(pollId) {
    return this.http.post(`${constants.apiUrl}/survey/terminate/${pollId}`, {});
  }

  restore(pollId) {
    return this.http.post(`${constants.apiUrl}/survey/restore/${pollId}`, {});
  }

  duplicate(pollId) {
    return this.http.post(`${constants.apiUrl}/survey/duplicate/${pollId}`, {});
  }

}
