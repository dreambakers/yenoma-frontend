import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { SnackbarComponent } from '../shared/snackbar/snackbar.component';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private _snackBar: MatSnackBar,
              public dialog: MatDialog,
              private translate: TranslateService) { }

  openSnackBar(messageKey: string, actionKey = 'labels.dismiss', duration = 5000) {
    const snackBar = this._snackBar.openFromComponent(SnackbarComponent, {
      data: {
        preClose: () => {snackBar.dismiss()},
        message: this.translate.instant(messageKey),
        action: this.translate.instant(actionKey)
      },
      duration
    });
  }
}
