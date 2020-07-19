import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Poll } from '../../poll/poll.model';
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
  submitted = false;
  constants = constants;

  constructor(
    private userService: UserService,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<ImportSurveyComponent>,
    private router: Router,
    private emitterService: EmitterService
  ) { }

  ngOnInit(): void {
    this.user = this.userService.getLoggedInUser();
  }

  import() {
    this.submitted = true;
    if (!this.importText) {
      return;
    }

    const newPoll = new Poll();
    newPoll.title = this.translate.instant('importOptions.title');
    newPoll.privateNote = this.translate.instant('importOptions.privateNote');
    newPoll.questions = [];

    const lines = this.importText.split('\n');
    let questionIndex = 0;
    let optionsCount = 0;

    for (const line of lines) {
      if (!(questionIndex < 29)) {
        break;
      }

      if (line && (line[0] === ' ' || line[0] === '-' || line[0] === '\t') && optionsCount <= 299) {
        newPoll.questions[questionIndex].options.push(line.substring(1).trim());
        optionsCount ++;
      } else if (line && line[0] !== ' ') {
        optionsCount = 0;
        newPoll.questions.length && questionIndex ++;
        newPoll.questions.push({
          text: line,
          answerType: constants.answerTypes.rating,
          options: []
        });
      }
    }

    if (!newPoll.questions.length) {
      newPoll.questions.push({
        text: '',
        answerType: constants.answerTypes.rating,
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
