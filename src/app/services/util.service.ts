import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor(private _snackBar: MatSnackBar,
    public dialog: MatDialog) { }

  openSnackBar(message: string, action = null, duration = 5000) {
    this._snackBar.open(message, action, {
      duration,
    });
  }

  confirmDialog(title, message): Observable<any> {

    const dialogData = new ConfirmDialogModel(title, message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      minWidth: "400px",
      // maxWidth: "400px",
      data: dialogData
    });

    return dialogRef.afterClosed();
  }

}
