import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(
    private translate: TranslateService
  ) { }

  ngOnInit() {
  }

  hasGlobalMessage(messageKey) {
    const message = this.translate.instant(`globalMessages.${messageKey}`);
    return message && message !== `globalMessages.${messageKey}`;
  }
}
