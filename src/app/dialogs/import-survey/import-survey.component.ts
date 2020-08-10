import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Poll } from '../../secure/poll/poll.model';
import { TranslateService } from '@ngx-translate/core';
import { constants } from '../../app.constants';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { EmitterService } from '../../services/emitter.service';

@Component({
  selector: 'app-import-survey',
  templateUrl: './import-survey.component.html',
  styleUrls: ['./import-survey.component.scss']
})
export class ImportSurveyComponent implements OnInit {

  user;
  importText;
  subscription;
  submitted = false;
  constants = constants;
  showInstructions = false;

  constructor(
    private userService: UserService,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<ImportSurveyComponent>,
    private router: Router,
    private emitterService: EmitterService
  ) { }

  ngOnInit(): void {
    this.user = this.userService.getLoggedInUser();
    this.userService.getSubscription().subscribe(
      (res: any) => {
        if (res.success) {
          this.subscription = res.subscription;
        }
      }
    );
  }

  import() {
    this.submitted = true;
    this.showInstructions = false;
    if (!this.importText || !this.subscription.isPro) {
      return;
    }

    const newPoll = new Poll();
    newPoll.title = this.translate.instant('importOptions.title');
    newPoll.privateNote = this.translate.instant('importOptions.privateNote');
    newPoll.questions = [];
    newPoll.status = constants.statusTypes.open;
    newPoll.automaticNumbering = true;

    const lines = this.importText.split('\n');
    let questionIndex = 0;
    let optionsCount = 0;

    for (const line of lines) {
      if (!(questionIndex < 29)) {
        break;
      }

      if (line && (line[0] === ' ' || line[0] === '-' || line[0] === '\t') && optionsCount <= 299) {
        if (line.substring(1).trim()) {
          const question = newPoll.questions[questionIndex];
          if (question) {
            question.options.push(line.substring(1).trim());
            optionsCount ++;
            if (optionsCount >= 2) {
              question.answerType = constants.answerTypes.radioButton;
            }
          }
        }
      } else if (line && line[0] === '+') {
        if (line.substring(1).trim()) {
          const question = newPoll.questions[questionIndex];
          if (question) {
            question.additionalText = question.additionalText || line.substring(1).trim();
          }
        }
      } else if (line && line[0] !== ' ') {
        optionsCount = 0;
        newPoll.questions.length && questionIndex ++;
        newPoll.questions.push({
          text: line,
          answerType: constants.answerTypes.yesNoMaybe,
          options: []
        });
      }
    }

    if (!newPoll.questions.length) {
      newPoll.questions.push({
        text: '',
        answerType: constants.answerTypes.yesNoMaybe,
        options: []
      });
    }

    this.router.navigate(['dashboard/create']).then(() => {
      this.onDismiss();
      setTimeout( () => {
        this.emitterService.emit(constants.emitterKeys.importSurveyData, newPoll);
      }, 10);
    });
  }

  onDismiss() {
    this.dialogRef.close(false);
  }

}
