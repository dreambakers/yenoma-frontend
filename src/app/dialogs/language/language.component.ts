import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { constants } from 'src/app/app.constants';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EmitterService } from 'src/app/services/emitter.service';
import { LanguageService } from 'src/app/services/language.service';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LanguageComponent implements OnInit {

  constants = constants;
  languages;
  selectedLanguage;

  constructor(
    public dialogRef: MatDialogRef<LanguageComponent>,
    private translate: TranslateService,
    private emitterService: EmitterService,
    private languageService: LanguageService
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

  onDismiss(): void {
    this.dialogRef.close(false);
  }

}
