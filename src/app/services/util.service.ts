import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private _snackBar: MatSnackBar,
              public dialog: MatDialog,
              private translate: TranslateService) { }

  openSnackBar(messageKey: string, actionKey = null, duration = 5000) {
    this._snackBar.open(this.translate.instant(messageKey), actionKey && this.translate.instant(actionKey), {
      duration,
    });
  }

  confirmDialog(title, message): Observable<any> {
    const dialogData = new ConfirmDialogModel(this.translate.instant(title), this.translate.instant(message));
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      minWidth: !DataService.isMobile ? "400px" : "280px",
      data: dialogData
    });
    return dialogRef.afterClosed();
  }

}
