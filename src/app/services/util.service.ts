import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from './data.service';
import { SortDialogComponent, SortDialogModel } from '../dialogs/sort/sort-dialog.component';
import { ChangePasswordComponent } from '../dialogs/change-password/change-password.component';

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

  confirmDialog(title, message): Observable<any> {
    const dialogData = new ConfirmDialogModel(this.translate.instant(title), this.translate.instant(message));
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      minWidth: !DataService.isMobile ? "400px" : "280px",
      data: dialogData
    });
    return dialogRef.afterClosed();
  }

  sortDialog(keys, currentSort): Observable<any> {
    const dialogData = new SortDialogModel(keys, currentSort);
    const dialogRef = this.dialog.open(SortDialogComponent, {
      minWidth: !DataService.isMobile ? "400px" : "280px",
      data: dialogData
    });
    return dialogRef.afterClosed();
  }

  openChangePasswordDialog(): Observable<any> {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      minWidth: !DataService.isMobile ? "400px" : "280px",
    });
    return dialogRef.afterClosed();
  }

}
