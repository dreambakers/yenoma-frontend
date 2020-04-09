import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PollService } from '../../services/poll.service';
import { UtilService } from '../../services/util.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-respond',
  templateUrl: './respond.component.html',
  styleUrls: ['./respond.component.scss']
})
export class RespondComponent implements OnInit {

  responseForm;
  submitted = false;

  constructor(private formBuilder: FormBuilder,
    private pollService: PollService,
    private utils: UtilService,
    private router: Router,
    private translate: TranslateService) { }

  ngOnInit() {
    this.responseForm = this.formBuilder.group({
      pollId: ['', [Validators.required, Validators.pattern(/^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i)]],
    });
  }

  get f() { return this.responseForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.responseForm.invalid) {
      return;
    }

    this.pollService.getPoll(this.responseForm.value.pollId).subscribe(
      (response: any) => {
        if (response.poll) {
          this.router.navigate(['view'], { queryParams: { id: this.responseForm.value.pollId } });

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
