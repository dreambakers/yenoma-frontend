import { Component, OnInit, Input, Inject } from '@angular/core';
import { constants } from 'src/app/app.constants';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import QRCode from 'qrcode'
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-share',
  templateUrl: './share.component.html',
  styleUrls: ['./share.component.scss']
})
export class ShareComponent implements OnInit {

  constants = constants;
  poll;
  url;
  qrUrl;

  constructor(
    public dialogRef: MatDialogRef<ShareComponent>,
    private translate: TranslateService,
    private utils: UtilService,
    @Inject(MAT_DIALOG_DATA) data) {
      this.poll = data.poll;
    }

  ngOnInit() {
    this.url = window.location.origin + `/p?id=${this.poll.shortId}`;
    this.generateQrCode();
  }

  onDismiss(): void {
    // Close the dialog, return false
    this.dialogRef.close(false);
  }

  generateQrCode() {

    QRCode.toDataURL(this.url, { margin: 2 })
    .then(url => {
      this.qrUrl = url;
    })
    .catch(err => {
      this.utils.openSnackBar('messages.pollLinkCopied');
    })
  }

  copyLink() {
    this.copyMessage(this.url);
    this.utils.openSnackBar('messages.pollLinkCopied');
  }

  download() {
    const a = document.createElement('a');
    a.href = this.qrUrl;
    a.download = this.poll.shortId + '.png';
    document.body.appendChild(a);
    a.click();
  }

  copyMessage(val: string){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

}
