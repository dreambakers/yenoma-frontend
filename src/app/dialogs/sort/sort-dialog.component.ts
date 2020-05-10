import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Component, OnInit, Inject } from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sort-dialog',
  templateUrl: './sort-dialog.component.html',
  styleUrls: ['./sort-dialog.component.scss']
})
export class SortDialogComponent implements OnInit {
  keys: string[];
  currentSort;
  currentSortCopy;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SortDialogModel,
    private translate: TranslateService) {
      this.keys = data.keys;
      this.currentSort = data.currentSort;
      this.currentSortCopy = data.currentSort;
  }

  ngOnInit() {
  }

  onConfirm(): void {
    if (JSON.stringify(this.currentSortCopy) === JSON.stringify(this.currentSort)) {
      return this.onDismiss();
    }
    this.dialogRef.close(this.currentSort);
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

  getKeyLabel(key) {
    const mapKeyToLabel = (key) => {
      switch(key) {
        case 'responses':
          return 'responders'
        case 'createdAt':
          return 'created'
        default:
          return key;
      }
    }

    return this.translate.instant(`labels.${mapKeyToLabel(key)}`);
  }

  onSortChanged(key, event = null) {
    const start = event?.value || 'asc';
    this.currentSort = { ...this.currentSort, id: key, start };
  }

  isSelected(key) {
    return this.currentSort.id === key;
  }

}

export class SortDialogModel {
  constructor(public keys: string[], public currentSort: {id: string, start: string, disableClear: boolean}) {
  }
}
