import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private _snackBar: MatSnackBar,
              public dialog: MatDialog,
              private translate: TranslateService) { }

  openSnackBar(messageKey: string, actionKey = 'labels.dismiss', duration = 5000) {
    this._snackBar.open(this.translate.instant(messageKey), this.translate.instant(actionKey), {
      duration,
    });
  }
}
