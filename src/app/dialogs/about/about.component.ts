import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { constants } from 'src/app/app.constants';
import * as moment from 'moment';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {

  constants = constants;

  constructor(
    public dialogRef: MatDialogRef<AboutComponent>,
    private translate: TranslateService) {
  }

  ngOnInit() {
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

  getLanguageDate() {
    const value = this.translate.instant(`metadata.creationDate`)
    if (value && value !== 'metadata.creationDate') {
      return moment(value).format('YYYY-MM-DD, HH:mm')
    }
    return '';
  }

}
