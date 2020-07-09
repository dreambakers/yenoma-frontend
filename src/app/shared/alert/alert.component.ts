import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

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
  @Input() passwordAlert;
  @Input() signedUp;
  @Output() onDismiss:EventEmitter<Boolean> = new EventEmitter();
  @Output() linkClicked:EventEmitter<Boolean> = new EventEmitter();

  dismissed = false;

  constructor() { }

  ngOnInit(): void {
  }

  dismiss() {
    this.dismissed = true;
    this.onDismiss.emit(true);
  }

  onLinkClick() {
    this.linkClicked.emit(true);
  }

  get isMobile() {
    return DataService.isMobile;
  }

}
