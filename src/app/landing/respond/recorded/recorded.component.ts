import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { PollService } from 'src/app/services/poll.service';
import { TranslateService } from '@ngx-translate/core';
import { Utility } from 'src/app/shared/utils/utility';
import { NgNavigatorShareService } from 'ng-navigator-share';
import { DomSanitizer } from '@angular/platform-browser';

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
  hasNavigatorShare = false;
  @Input() messageKey;
  @Output() onBackToPoll = new EventEmitter();

  constructor(
    private route: ActivatedRoute,
    private pollService: PollService,
    private translate: TranslateService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private sanitizer:DomSanitizer
  ) { }

  ngOnInit(): void {
    this.hasNavigatorShare = this.ngNavigatorShareService.canShare();
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
    const text = this.translate.instant('messages.sharePoll');
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

  navigatorShare() {
    this.ngNavigatorShareService.share({
      title: this.translate.instant('messages.sharePollTitle'),
      text: this.translate.instant('messages.sharePoll'),
      url: this.getSuveryUrl(false),
    })
  }

  sanitize(url:string){
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  getUrlForWhatsApp() {
    return `whatsapp://send?text=` + this.getSuveryUrl();
  }
}
