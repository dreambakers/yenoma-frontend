import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  constructor(
    private http: HttpClient,
    private translate: TranslateService
  ) { }

  getLanguages() {
    return this.http.get("assets/i18n/metadata.json");
  }

  getLanguageFile() {
    return this.http.get(`assets/i18n/${this.translate.currentLang}.json`);
  }

}
