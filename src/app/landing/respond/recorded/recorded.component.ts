import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { PollService } from 'src/app/services/poll.service';
import { TranslateService } from '@ngx-translate/core';
import { Utility } from 'src/app/shared/utils/utility';

@Component({
  selector: 'app-recorded',
  templateUrl: './recorded.component.html',
  styleUrls: ['./recorded.component.scss']
})
export class RecordedComponent implements OnInit {

  poll;
  title;
  message;
  loading = false;
  @Input() messageKey;
  @Output() onBackToPoll = new EventEmitter();

  constructor(
    private route: ActivatedRoute,
    private pollService: PollService,
    private translateService: TranslateService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      this.loading = true;
      this.pollService.getPoll(params['id']).subscribe(
        (res: any) => {
          if (res.success) {
            this.poll = res.poll;
            this.title = res.poll.thankYouTitle;
            this.message = res.poll.thankYouMessage;
          }
          this.loading = false;
        },
      err => {
          this.loading = false;
        }
      );
    });
  }

  onBackToPollClick() {
    this.onBackToPoll.emit();
  }

  getSharingText(encode = true) {
    const text = this.translateService.instant('messages.sharePoll');
    if (encode) {
      return encodeURI(text);
    }
    return text;
  }

  getSuveryUrl(encode = true) {
    const url = Utility.getPollUrl(this.poll);
    if (encode) {
      return encodeURIComponent(url);
    }
    return url;
  }

  getCombinedText() {
    return this.getSharingText() + encodeURI(' ') + this.getSuveryUrl();
  }

}
