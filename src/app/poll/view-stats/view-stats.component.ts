import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from 'src/app/services/poll.service';
import { UtilService } from 'src/app/services/util.service';
import { constants } from 'src/app/app.constants';

import { TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/services/data.service';
import { Subject } from 'rxjs';
import { EmitterService } from 'src/app/services/emitter.service';
import { takeUntil } from 'rxjs/operators';
import { Stats } from 'src/app/shared/utils/calculate-stats';

@Component({
  selector: 'app-view-stats',
  templateUrl: './view-stats.component.html',
  styleUrls: ['./view-stats.component.scss']
})
export class ViewStatsComponent implements OnInit {

  poll;
  responses;
  answerMap:any;
  loading = false;
  rearrangeQuestions = false;

  constants = constants;

  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private pollService: PollService,
    private route: ActivatedRoute,
    private utils: UtilService,
    private router: Router,
    private translate: TranslateService,
    private emitterService: EmitterService
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      const pollId = params['id'];
      this.pollService.managePoll(pollId).subscribe(
        (res: any) => {
          if (res.success) {
            this.poll = res.poll;
            this.responses = res.responses;
            if (res.responses) {
              this.answerMap = new Stats(this.responses).getAnswerMap();
              this.poll.questions.forEach(question => {
                if (!question.options.length) {
                  question.options.push('');
                  question['hasOptions'] = false;
                } else {
                  question['hasOptions'] = true;
                }
              });
            }
            this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, {
              key: 'labels.surveyStats',
              extra: ` (${this.responses.length})`
            });
            this.emitterService.emit(constants.emitterKeys.updateNavbarProps, { home: true });
          } else {
            this.utils.openSnackBar('errors.e003_gettingSurvey');
          }
        },
        (err) => {
          this.utils.openSnackBar('errors.e003_gettingSurvey');
        }
      )
    });

    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.home:
          return this.onBackClicked();
      }
    });
  }

  getTableValue(questionIndex, optionIndex, value) {
    if (this.answerMap[questionIndex][optionIndex][value]) {
      const valuePercentage = (this.answerMap[questionIndex][optionIndex][value] / this.answerMap[questionIndex]['responses']) * 100;
      return `${this.answerMap[questionIndex][optionIndex][value]} (${valuePercentage.toFixed(1)}%)`;
    } else {
      return '0 (0.0%)'
    }
  }

  getProgressBarColor(percentage) {
    if (percentage <= 12.5) {
      return '#f44336';
    } else if (percentage > 12.5 && percentage <= 25) {
      return '#ff5722';
    } else if (percentage > 25 && percentage <= 37.5) {
      return '#ff9800';
    } else if (percentage > 37.5 && percentage <= 50) {
      return '#ffc107';
    } else if (percentage > 50 && percentage <= 62.5) {
      return '#ffeb3b';
    } else if (percentage > 62.5 && percentage <= 75) {
      return '#cddc39';
    } else if (percentage > 75 && percentage <= 87.5) {
      return '#8bc34a';
    } else if (percentage > 87.5 && percentage <= 100) {
      return '#4caf50';
    }
  }

  getResponsePercentage(answer, i, j = 0) {
    if (this.answerMap[i][j][answer]) {
      const valuePercentage = (this.answerMap[i][j][answer] / this.answerMap[i]['responses']) * 100;
      return valuePercentage.toFixed(1);
    } else {
      return '0.0';
    }
  }

  getResponseCount(answer, i, j = 0) {
    return this.answerMap[i][j][answer] || 0
  }

  getResponseValue(i, j = 0) {
    if (this.answerMap[i].type !== constants.answerTypes.text) {
      return this.answerMap[i][j]['response'];
    } else {
      return this.getResponsePercentage(100, i, j);
    }
  }

  onBackClicked() {
    this.router.navigate(['/dashboard/all']);
  }

  getOptions(question) {
    return this.constants.options[question.answerType];
  }

  getAnswerTypeLabel(question) {
    return this.translate.instant(`answerTypes.${question.answerType}`);
  }

  getAnswerLabel(answerKey, answerType) {
    let labelKey;
    if (answerType === constants.answerTypes.rating) {
      switch (answerKey) {
        case 100:
          return 5;
        case 75:
          return 4;
        case 50:
          return 3;
        case 25:
          return 2;
        case 0:
          return 1;
      }
    } else if (answerType === constants.answerTypes.dropdown) {
      return answerKey / 10;
    } else {
      switch(answerKey){
        case 100:
          switch(answerType) {
            case constants.answerTypes.binary:
            case constants.answerTypes.yesNoMaybe:
              labelKey = 'yes';
              break;
            case constants.answerTypes.radioButton:
            case constants.answerTypes.checkbox:
              labelKey = 'checked';
              break;
            case constants.answerTypes.text:
            case constants.answerTypes.email:
              labelKey = 'filled';
              break;
          }
          break;

        case 50:
          labelKey = 'maybe';
          break;

        case 0:
          switch(answerType) {
            case constants.answerTypes.binary:
            case constants.answerTypes.yesNoMaybe:
              labelKey = 'no';
              break;
            case constants.answerTypes.radioButton:
            case constants.answerTypes.checkbox:
              labelKey = 'unchecked';
              break;
            case constants.answerTypes.text:
            case constants.answerTypes.email:
              labelKey = 'unfilled';
              break;
          }
          break;
      }
      const label = this.translate.instant(`answers.${labelKey}`);
      return label.includes('answers.') ? answerKey : label;
    }
  }

  canExpand(question) {
    return ![constants.answerTypes.slider, constants.answerTypes.value].includes(question.answerType);
  }

  toggleDetails(question, i, j) {
    if (question.expanded) {
      question['expanded'][i][j] = !question['expanded'][i][j];
    }
    else {
      question['expanded'] = { [i]: { [j]: true } };
    }
  }

  ngOnDestroy(): void {
    this.emitterService.emit(this.constants.emitterKeys.resetNavbar);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  get isMobile() {
    return DataService.isMobile;
  }
}
