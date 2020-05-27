import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { constants } from 'src/app/app.constants';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { EmitterService } from 'src/app/services/emitter.service';

@Component({
  selector: 'app-language',
  templateUrl: './language.component.html',
  styleUrls: ['./language.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class LanguageComponent implements OnInit {

  constants = constants;
  languages = this.constants.languages;
  selectedLanguage;

  constructor(
    public dialogRef: MatDialogRef<LanguageComponent>,
    private translate: TranslateService,
    private emitterService: EmitterService
  ) {
  }

  ngOnInit() {
    this.selectedLanguage = this.translate.currentLang;
  }

  languageChanged(event) {
    this.emitterService.emit(this.constants.emitterKeys.languageChanged, event);
  }

  onDismiss(): void {
    this.dialogRef.close(false);
  }

}
