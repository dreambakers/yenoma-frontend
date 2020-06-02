import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { DataService } from './data.service';
import { SortDialogModel, SortDialogComponent } from '../dialogs/sort/sort-dialog.component';
import { ChangePasswordComponent } from '../dialogs/change-password/change-password.component';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AboutComponent } from '../dialogs/about/about.component';
import { LanguageComponent } from '../dialogs/language/language.component';
import { constants } from '../app.constants';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constants = constants;

  constructor(
    public dialog: MatDialog,
    private translate: TranslateService
  ) { }

  confirm(title, message): Observable<any> {
    const dialogData = new ConfirmDialogModel(this.translate.instant(title), this.translate.instant(message));
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      minWidth: !DataService.isMobile ? this.constants.dialogWidth.desktop : this.constants.dialogWidth.mobile,
      data: dialogData
    });
    return dialogRef.afterClosed();
  }

  sort(keys, currentSort): Observable<any> {
    const dialogData = new SortDialogModel(keys, currentSort);
    const dialogRef = this.dialog.open(SortDialogComponent, {
      minWidth: !DataService.isMobile ? this.constants.dialogWidth.desktop : this.constants.dialogWidth.mobile,
      data: dialogData
    });
    return dialogRef.afterClosed();
  }

  changePassword(): Observable<any> {
    const dialogRef = this.dialog.open(ChangePasswordComponent, {
      minWidth: !DataService.isMobile ? this.constants.dialogWidth.desktop : this.constants.dialogWidth.mobile,
    });
    return dialogRef.afterClosed();
  }

  about(): Observable<any> {
    const dialogRef = this.dialog.open(AboutComponent, {
      minWidth: !DataService.isMobile ? this.constants.dialogWidth.desktop : this.constants.dialogWidth.mobile,
    });
    return dialogRef.afterClosed();
  }

  language(): Observable<any> {
    const dialogRef = this.dialog.open(LanguageComponent, {
      minWidth: !DataService.isMobile ? this.constants.dialogWidth.desktop : this.constants.dialogWidth.mobile,
    });
    return dialogRef.afterClosed();
  }

}
