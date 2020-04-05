import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from 'src/app/services/poll.service';
import { Response } from '../response.model';
import { ResponseService } from 'src/app/services/response.service';
import { UtilService } from 'src/app/services/util.service';
import { constants } from 'src/app/app.constants';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

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

  constructor(
    private pollService: PollService,
    private route: ActivatedRoute,
    private utils: UtilService,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      const pollId = params['id'];
      this.pollService.managePoll(pollId).subscribe(
        (res: any) => {
          if (res.success) {
            this.poll = res.poll;
            this.responses = res.responses;
            if (res.responses) {
              this.getResponseForQuestions();
            }
          } else {
            this.utils.openSnackBar('An error occurred while getting the poll');
          }
        },
        (err) => {
          this.utils.openSnackBar('An error occurred while getting the poll');
        }
      )
    });
  }

  ngOnInit() { }

  getResponseForQuestions() {
    this.answerMap = {};

    const insertAnswer = (answerIndex, answer, question) => {
      if (answerIndex in question && answer in question[answerIndex]) {
        return question[answerIndex][answer] += 1;
      }
      question[answerIndex] = { ...question[answerIndex], [answer]: 1 };
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
          question[optionIndex]['response'] = (response / 100).toFixed(2);
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

      case constants.answerTypes.slider:
        return this.getWeightForSlider;

      default:
        return this.getWeightForRating;
    }
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

  getWeightForSlider(value): Number {
    return +value;
  }

  getWeightForYNM(answer): Number {
    return answer === 'yes' ? 100 : (answer === 'maybe' ? 50 : 0);
  }

  getStarCountFromResponse(response) {
    if (response >= 0 && response < 20) {
      return 1;
    } else if (response >= 20 && response < 40) {
      return 2;
    } else if (response >= 40 && response < 60) {
      return 3;
    } else if (response >= 60 && response < 80) {
      return 4;
    } else {
      return 5;
    }
  }

  getTableValue(questionIndex, optionIndex, value) {
    if (this.answerMap[questionIndex][optionIndex][value]) {
      const valuePercentage = (this.answerMap[questionIndex][optionIndex][value] / this.answerMap[questionIndex]['responses']) * 100;
      return `${this.answerMap[questionIndex][optionIndex][value]} (${valuePercentage.toFixed(1)}%)`;
    } else {
      return '0 (0.0%)'
    }
  }

  getYNMFromScore(score) {
    if (score >= 0 && score < 33.33) {
      return 'No';
    } else if (score >= 33.33 && score <= 66.66) {
      return 'Maybe';
    } else if (score >= 66.66 && score <= 100) {
      return 'Yes';
    }
  }

  onBackClicked() {
    this.router.navigate(['/dashboard/all']);
  }
}
