import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PollService } from '../../services/poll.service';
import { UtilService } from '../../services/util.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-respond',
  templateUrl: './respond.component.html',
  styleUrls: ['./respond.component.scss']
})
export class RespondComponent implements OnInit {

  responseForm;
  submitted = false;
  responded = false;
  action;

  constructor(private formBuilder: FormBuilder,
    private pollService: PollService,
    private utils: UtilService,
    private router: Router,
    private translate: TranslateService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.responseForm = this.formBuilder.group({
      pollId: ['', [Validators.required, Validators.pattern(/^[1-9a-zA-Z]{8}$/i)]]
    });

    this.route.queryParams.pipe(take(1)).subscribe(params => {
      if (params['id']) {
        this.responseForm.controls['pollId'].setValue(params['id']);
        if (params['responded'] && params['action']) {
          this.responded = true;
          this.action = params['action'];
        }
      }
    });
  }

  get f() { return this.responseForm.controls; }

  getMessageKey() {
    return this.action === 'recorded' ? 'messages.responseRecorded' : 'messages.responseUpdated';
  }

  onSubmit() {
    this.submitted = true;

    if (this.responseForm.invalid) {
      return;
    }

    this.pollService.getPoll(this.responseForm.value.pollId).subscribe(
      (response: any) => {
        if (response.poll) {
          this.router.navigate(['p'], { queryParams: { id: this.responseForm.value.pollId } });
        } else {
          this.utils.openSnackBar('messages.noPollFoundAgainstId', 'labels.retry');
        }
      },
      errorResponse => {
        this.utils.openSnackBar('messages.errorGettingPoll');
      }
    );
  }

}
