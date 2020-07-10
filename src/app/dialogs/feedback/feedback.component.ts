import { Component, OnInit } from '@angular/core';
import { LanguageService } from 'src/app/services/language.service';
import { MatDialogRef } from '@angular/material/dialog';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {
  selectedOption;
  feedbackOptions;
  description;
  submitted = false;

  constructor(
    public dialogRef: MatDialogRef<FeedbackComponent>,
    private languageService: LanguageService,
    private userService: UserService,
    private utilService: UtilService
  ) { }

  ngOnInit(): void {
    this.languageService.getLanguageFile().subscribe(
      (res: any) => {
        this.feedbackOptions = res.feedbackOptions;
        this.selectedOption = this.feedbackOptions[Object.keys(this.feedbackOptions)[0]];
      }
    );
  }

  onDismiss() {
    this.dialogRef.close(false);
  }

  sendFeedback() {
    this.submitted = true;
    if (!this.description) { return; }

    this.userService.sendFeedback({
      option: this.selectedOption,
      description: this.description
    }).subscribe(
      (res: any) => {
        if (res.success) {
          this.utilService.openSnackBar('messages.feedbackSent');
          this.onDismiss();
        } else {
          this.utilService.openSnackBar('errors.e020_sendingFeedback');
        }
      },
      err => {
        this.utilService.openSnackBar('errors.e020_sendingFeedback');
      }
    );
  }

}
