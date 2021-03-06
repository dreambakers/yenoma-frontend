import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from '../../../services/poll.service';
import { UtilService } from '../../../services/util.service';
import { constants } from '../../../app.constants';

import { TranslateService } from '@ngx-translate/core';
import { DataService } from '../../../services/data.service';
import { Subject } from 'rxjs';
import { EmitterService } from '../../../services/emitter.service';
import { takeUntil } from 'rxjs/operators';
import { Stats } from '../../../shared/utils/calculate-stats';
import { ResponseService } from 'src/app/services/response.service';

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
    private emitterService: EmitterService,
    private responseService: ResponseService
  ) { }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      const pollId = params['id'];

      this.responseService.getResponsesForPoll(pollId).subscribe(
        (res: any) => {
          if (res.success) {
            this.responses = res.responses;
            this.answerMap = new Stats(this.responses).getAnswerMap();
            this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, {
              key: 'labels.surveyStats',
              extra: ` (${this.responses.length})`
            });
            this.emitterService.emit(constants.emitterKeys.updateNavbarProps, { home: true });
          } else {
            this.utils.openSnackBar('errors.e011_gettingResponses');
          }
        },
        (err) => {
          this.utils.openSnackBar('errors.e011_gettingResponses');
        }
      );

      this.pollService.managePoll(pollId).subscribe(
        (res: any) => {
          if (res.success) {
            this.poll = res.poll;
            this.poll.questions.forEach(question => {
              if (!question.options.length) {
                question.options.push('');
                question['hasOptions'] = false;
              } else {
                question['hasOptions'] = true;
              }
            });
          } else {
            this.utils.openSnackBar('errors.e003_gettingSurvey');
          }
        },
        (err) => {
          this.utils.openSnackBar('errors.e003_gettingSurvey');
        }
      );
    });

    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.home:
          return this.onBackClicked();
      }
    });
  }

  // Desktop view table column
  getTableValue(questionIndex, optionIndex, value) {
    switch(this.poll.questions[questionIndex].answerType) {
      case constants.answerTypes.list:
        const valueIndex = this.getOptions(this.poll.questions[questionIndex]).indexOf(value);
        return this.answerMap[questionIndex][optionIndex][valueIndex] || 0;

      case constants.answerTypes.dropdown:
        const result = { count: 0, percentage: '0.0%' };
        if (this.answerMap[questionIndex][optionIndex][value]) {
          const valuePercentage = (this.answerMap[questionIndex][optionIndex][value] / this.answerMap[questionIndex]['responses']) * 100;
          result.count = this.answerMap[questionIndex][optionIndex][value];
          result.percentage = valuePercentage.toFixed(1) + '%';
        }
        return result;

      default:
        if (this.answerMap[questionIndex][optionIndex][value]) {
          const valuePercentage = (this.answerMap[questionIndex][optionIndex][value] / this.answerMap[questionIndex]['responses']) * 100;
          return `${this.answerMap[questionIndex][optionIndex][value]} (${valuePercentage.toFixed(1)}%)`;
        } else {
          return '0 (0.0%)'
        }
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

  // Mobile view response percentage
  getResponsePercentage(answer, i, j = 0) {
    switch(this.answerMap[i].type) {
      case this.constants.answerTypes.list:
        const valueIndex = this.getOptions(this.poll.questions[i]).indexOf(answer);
        return this.answerMap[i][j][valueIndex] >= 1 ? (
          ((this.answerMap[i][j][valueIndex] / this.answerMap[i]['responses']) * 100).toFixed(1)
        ) : '0.0';

      default:
        if (this.answerMap[i][j][answer]) {
          const valuePercentage = (this.answerMap[i][j][answer] / this.answerMap[i]['responses']) * 100;
          return valuePercentage.toFixed(1);
        } else {
          return '0.0';
        }
    }
  }

  // Mobile view response count
  getResponseCount(answer, i, j = 0) {
    switch(this.answerMap[i].type) {
      case this.constants.answerTypes.list:
        const valueIndex = this.getOptions(this.poll.questions[i]).indexOf(answer);
        return this.answerMap[i][j][valueIndex] || 0;
      default:
        return this.answerMap[i][j][answer] || 0;
    }
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
    switch(question.answerType) {
      case constants.answerTypes.list:
        return [...new Set(question.listElements.split(';').filter(element => element))];
      default:
        return this.constants.options[question.answerType];
    }
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
