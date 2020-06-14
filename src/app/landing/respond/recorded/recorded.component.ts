import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { PollService } from 'src/app/services/poll.service';

@Component({
  selector: 'app-recorded',
  templateUrl: './recorded.component.html',
  styleUrls: ['./recorded.component.scss']
})
export class RecordedComponent implements OnInit {

  title;
  message;
  loading = false;
  @Input() messageKey;
  @Output() onBackToPoll = new EventEmitter();

  constructor(
    private route: ActivatedRoute,
    private pollService: PollService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      this.loading = true;
      this.pollService.getPoll(params['id']).subscribe(
        (res: any) => {
          if (res.success) {
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

}
