import { Component, OnInit } from '@angular/core';
import { constants } from 'src/app/app.constants';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-terms-and-conditions',
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit {

  constants = constants;

  constructor(
    public dialogRef: MatDialogRef<TermsAndConditionsComponent>,
    private translate: TranslateService) {
  }

  ngOnInit() {
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

}
