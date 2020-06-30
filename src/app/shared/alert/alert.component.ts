import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit {

  @Input() dismissible: Boolean = true;
  @Input() type = 'info';
  @Input() messageKey;
  @Input() message;
  @Input() class;
  @Input() emailAlert;
  @Input() signedUp;
  @Output() onDismiss:EventEmitter<Boolean> = new EventEmitter();
  @Output() emailVerificationLinkClicked:EventEmitter<Boolean> = new EventEmitter();

  dismissed = false;

  constructor() { }

  ngOnInit(): void {
    console.log(this.emailAlert)
  }

  dismiss() {
    this.dismissed = true;
    this.onDismiss.emit(true);
  }

  enableRegistrationVerification() {
    this.emailVerificationLinkClicked.emit(true);
  }

}
