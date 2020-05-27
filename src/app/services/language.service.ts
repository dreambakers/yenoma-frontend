import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(
    private http: HttpClient
  ) { }

  getLanguages() {
    return this.http.get("assets/i18n/metadata.json");
  }

}
