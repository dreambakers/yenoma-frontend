import { Component, OnInit } from '@angular/core';
import { EmitterService } from 'src/app/services/emitter.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';
import { constants } from 'src/app/app.constants';
import { UserService } from 'src/app/services/user.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {

  constants = constants;
  languages;
  selectedLanguage;
  user;

  constructor(
    private translate: TranslateService,
    private emitterService: EmitterService,
    private languageService: LanguageService,
    private userService: UserService
  ) {
  }

  ngOnInit() {
    this.user = this.userService.getLoggedInUser();
    this.selectedLanguage = this.translate.currentLang;
    this.languageService.getLanguages().subscribe(
      (res: any) => {
        this.languages = res.languages;
      }
    );
  }

  languageChanged(event) {
    this.emitterService.emit(this.constants.emitterKeys.languageChanged, event);
  }

  get currentBreakpoint() {
    return DataService.currentBreakpoint;
  }
}