import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { constants } from 'src/app/app.constants';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constants = constants;
  metadata;

  constructor(
    public dialogRef: MatDialogRef<AboutComponent>,
    private translate: TranslateService,
    private http: HttpClient) {
  }

  ngOnInit() {
    this.getTranslationFileContent().subscribe(data => {
      this.metadata = data.metadata;
    });
  }

  getTranslationFileContent(): Observable<any> {
    return this.http.get(`./assets/i18n/${this.translate.currentLang}.json`);
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

  getLabel(key) {
    let label = this.translate.instant(`labels.${key}`);
    return label;
  }

  getValue(key) {
    let value = this.translate.instant(`metadata.${key}`);
    if (key === 'creationDate') {
      value = this.getParsedDate(value);
    }
    return value;
  }

  getParsedDate(date) {
    if (date) {
      return moment(date).format('YYYY-MM-DD, HH:mm');
    } else {
      return '-';
    }
  }

}
