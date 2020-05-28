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
              this.getResponseForQuestions();
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
              key: 'labels.pollStats',
              extra: ` (${this.responses.length})`
            });
            this.emitterService.emit(constants.emitterKeys.updateNavbarProps, { home: true });
          } else {
            this.utils.openSnackBar('errors.e003_gettingPoll');
          }
        },
        (err) => {
          this.utils.openSnackBar('errors.e003_gettingPoll');
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

  getResponseForQuestions() {
    this.answerMap = {};

    const insertAnswer = (answerIndex, answer, question) => {
      let key = answer;
      if (question.type === constants.answerTypes.text) {
        key = answer ? 'filled' : 'unfilled';
      }
      if (answerIndex in question && key in question[answerIndex]) {
        return question[answerIndex][key] += 1;
      }
      question[answerIndex] = { ...question[answerIndex], [key]: 1 }
    }

    for (const response of this.responses) {
      for (let questionIndex = 0; questionIndex < response.questions.length; questionIndex++) {
        const question = response.questions[questionIndex];  // actual question from response
        let _question = this.answerMap[questionIndex];  // map entry
        if (!_question) {
          this.answerMap[questionIndex] = { type: question.answerType, options: question.answers.length || 1, responses: 0 };
          _question = this.answerMap[questionIndex];
        }
        if (question.answers.length) {
          for (let answerIndex = 0; answerIndex < question.answers.length; answerIndex ++) {
            const answerObj = question.answers[answerIndex];
            insertAnswer(answerIndex, answerObj.answer, _question);
          }
        } else {
          const answerIndex = 0;
          insertAnswer(answerIndex, question.answer, _question);
        }
        _question.responses ++;
      }
    }

    for (const questionIndex of Object.keys(this.answerMap)) {
      const question = this.answerMap[questionIndex];
      for (let optionIndex = 0; optionIndex < question.options; optionIndex ++) {
        let response = 0;
        for (const option of Object.keys(question[optionIndex])) {
          const optionResponses = question[optionIndex][option];
          const answerPercentage = (optionResponses / question.responses) * 100;
          const answerWeight = this.getWeightFunctionForAnswer(question.type)(option);
          response += answerPercentage * answerWeight;
          question[optionIndex]['response'] = (response / 100).toFixed(1);
        }
      }
    }
  }

  getWeightFunctionForAnswer(questionType): Function {
    switch (questionType) {

      case constants.answerTypes.binary:
        return this.getWeightForBinary;

      case constants.answerTypes.checkbox:
      case constants.answerTypes.radioButton:
        return this.getWeightForCheckboxOrRadio;

      case constants.answerTypes.radioButton:
        return this.getWeightForCheckboxOrRadio;

      case constants.answerTypes.yesNoMaybe:
        return this.getWeightForYNM;

      case constants.answerTypes.smiley:
        return this.getWeightForSmiley;

      case constants.answerTypes.slider:
      case constants.answerTypes.value:
        return this.getWeightFromValue;

      case constants.answerTypes.dropdown:
        return this.getWeightForDropdown;

      default:
        return this.getWeightForRating;
    }
  }

  getWeightForDropdown(value): Number {
    return +value * 10;
  }

  getWeightForRating(rating): Number {
    switch (+rating) {
      case 5:
        return 100;
      case 4:
        return 75;
      case 3:
        return 50;
      case 2:
        return 25;
      default:
        return 0;
    }
  }

  getWeightForBinary(answer): Number {
    return answer === 'yes' ? 100 : 0;
  }

  getWeightForCheckboxOrRadio(checked): Number {
    return checked === 'true' ? 100: 0;
  }

  getWeightFromValue(value): Number {
    return +value;
  }

  getWeightForYNM(answer): Number {
    return answer === 'yes' ? 100 : (answer === 'maybe' ? 50 : 0);
  }

  getWeightForSmiley(answer): Number {
    return answer === 'happy' ? 100 : (answer === 'medium' ? 50 : 0);
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
      return this.getResponsePercentage('filled', i, j);
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

  getAnswerLabel(answerKey) {
    const label = this.translate.instant(`answers.${answerKey}`);
    return label.includes('answers.') ? answerKey : label;
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
