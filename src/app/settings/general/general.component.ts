import { Component, OnInit, Input } from '@angular/core';
import { EmitterService } from 'src/app/services/emitter.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from 'src/app/services/language.service';
import { constants } from 'src/app/app.constants';
import { UserService } from 'src/app/services/user.service';
import { DataService } from 'src/app/services/data.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-general',
  templateUrl: './general.component.html',
  styleUrls: ['./general.component.scss']
})
export class GeneralComponent implements OnInit {

  constants = constants;
  languages;
  selectedLanguage;
  @Input() user;

  constructor(
    private translate: TranslateService,
    private emitterService: EmitterService,
    private languageService: LanguageService,
    private userService: UserService,
    private utils: UtilService
  ) {
  }

  ngOnInit() {
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

  updateProfile() {
    this.userService.updateProfile({ country: this.user.country }).subscribe(
      (res: any) => {
        if (res.success) {
          this.utils.openSnackBar('messages.profileUpdated');
        } else {
          this.utils.openSnackBar('errors.e018_updatingProfile', 'labels.retry');
        }
      },
      err => {
        this.utils.openSnackBar('errors.e018_updatingProfile', 'labels.retry');
      }
    );
  }

  get currentBreakpoint() {
    return DataService.currentBreakpoint;
  }
}