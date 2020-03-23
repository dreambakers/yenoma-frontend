import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from 'src/app/services/poll.service';
import { Response } from '../response.model';
import { ResponseService } from 'src/app/services/response.service';
import { UtilService } from 'src/app/services/util.service';
import { constants } from 'src/app/app.constants';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-manage-poll',
  templateUrl: './manage-poll.component.html',
  styleUrls: ['./manage-poll.component.scss']
})
export class ManagePollComponent implements OnInit {

  response: Response = {
    questions: [],
    for: ''
  };

  poll;
  pollCopy;
  responses;
  loading = false;
  submitted = false;
  rearrangeQuestions = false;

  constants = constants;

  constructor(
    private router: Router,
    private pollService: PollService,
    private route: ActivatedRoute,
    private responseService: ResponseService,
    private utils: UtilService
  ) {
    this.route.queryParams.subscribe(params => {
      const pollId = params['id'];
      this.pollService.getPoll(pollId).subscribe(
        (res: any) => {
          if (res.success) {
            this.poll = res.poll;
            this.responses = res.responses;
            this.pollCopy = JSON.stringify(this.poll);
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

  createNew() {
    this.router.navigate(['/']);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.poll.questions, event.previousIndex, event.currentIndex);
  }

  addQuestion() {
    this.poll.questions.push({ text: '', options: [], answerType: constants.answerTypes.binary });
  }

  removeQuestion(questionIndex) {
    this.poll.questions.splice(questionIndex, 1);
  }

  addOption(questionIndex) {
    this.poll.questions[questionIndex].options.push('');
  }

  removeOption(questionIndex, index) {
    this.poll.questions[questionIndex].options.splice(index, 1);
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  get isValid() {
    return this.poll.description && this.poll.title && this.poll.questions.every(question => question.text && question.options.every(option => option.length));
  }

  get dirty() {
    return JSON.stringify(this.poll) !== this.pollCopy;
  }

  updatePoll() {
    this.pollService.updatePoll(this.poll).subscribe(
      (res: any) => {
        if (res.success) {
          this.utils.openSnackBar('Poll successfully updated', 'Great!');
          this.pollCopy = JSON.stringify(this.poll);
        }
      },
      err => {
        this.utils.openSnackBar('An error occurred while updating the poll');
      }
    );
  }

  get shouldDisable() {
    return this.poll.status === constants.statusTypes.terminated || this.responses.length > 0;
  }

  getResponseForQuestion(questionId) {
    let overallResponse = 0;
    let totalResponses = 0;

    for (const response of this.responses) {
      const question = response.questions.find(question => question._id === questionId);
      if (question) {
        const getPercentage = this.getPercentageFunctionForQuestion(question.answerType);
        let questionResponse;
        if (question.answers.length) {
          let avgResponse = 0;
          for (const answerObj of question.answers) {
            avgResponse += getPercentage(answerObj.answer);
          }
          questionResponse = avgResponse / question.answers.length;
        } else {
          questionResponse = getPercentage(question.answer);
        }
        overallResponse += questionResponse;
        totalResponses += 1;
      }
    }
    return (overallResponse / totalResponses).toFixed(2);
  }

  getPercentageFunctionForQuestion(questionType) {
    switch (questionType) {
      case constants.answerTypes.binary:
        return this.getPercentageFromBinary;
      default:
        return this.getPercentageFromRating;
    }
  }

  getPercentageFromRating(rating) {
    switch (rating) {
      case '5':
        return 100;
      case '4':
        return 75;
      case '3':
        return 50;
      case '2':
        return 25;
      default:
        return 0;
    }
  }

  getPercentageFromBinary(answer) {
    return answer === 'yes' ? 100 : 0;
  }

}
