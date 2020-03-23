import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from 'src/app/services/poll.service';
import { StarRatingColor } from 'src/app/star-rating/star-rating.component';
import { Response } from '../response.model';
import { ResponseService } from 'src/app/services/response.service';
import { UtilService } from 'src/app/services/util.service';
import { constants } from 'src/app/app.constants';

@Component({
  selector: 'app-view-poll',
  templateUrl: './view-poll.component.html',
  styleUrls: ['./view-poll.component.scss']
})
export class ViewPollComponent implements OnInit {

  response: Response = {
    questions: [],
    for: ''
  };
  responseCopy;

  poll;

  rating: number = 3;
  starCount: number = 5;
  starColor: StarRatingColor = StarRatingColor.accent;
  starColorP: StarRatingColor = StarRatingColor.primary;
  starColorW: StarRatingColor = StarRatingColor.warn;

  hasResponded = false;

  constants = constants;

  constructor(
    private router: Router,
    private pollService: PollService,
    private route: ActivatedRoute,
    private responseService: ResponseService,
    private utils: UtilService,
  ) {
    this.route.queryParams.subscribe(params => {
      const pollId = params['id'];
      if (pollId) {
        this.pollService.getPoll(pollId).subscribe(
          (res: any) => {
            if (res.success) {
              this.poll = res.poll;
              if (this.getResponseFromLocalStorage(this.poll._id)) {
                this.response = this.getResponseFromLocalStorage(this.poll._id);
                this.hasResponded = true;
              } else {
                this.poll.questions.forEach(question => {
                  this.response.questions.push({
                    _id: question._id,
                    text: question.text,
                    answers: question.options.map(option => ({ option, answer: '' })),
                    answerType: question.answerType
                  });
                });

                this.response.for = res.poll._id;
              }
              this.responseCopy = JSON.stringify(this.response);
            } else {
              this.utils.openSnackBar('An error occurred while getting the poll');
            }
          },
          (err) => {
            this.utils.openSnackBar('An error occurred while getting the poll');
          }
        );
      }
    });
  }

  ngOnInit() { }

  vote() {
    if (this.hasResponded) {
      this.responseService.updateResponse(this.response).subscribe((res: any) => {
        if (res.success) {
          this.utils.openSnackBar('Your response has been updated.', 'Great!');
          this.addResponseToLocalStorage(res.response);
          this.responseCopy = JSON.stringify(res.response);
          this.response = res.response;
        }
      }, err => {
        this.utils.openSnackBar('An error occurred while updating the response');
      });
    } else {
      this.responseService.recordResponse(this.response).subscribe((res: any) => {
        if (res.success) {
          this.utils.openSnackBar('Your response has been recorded.', 'Great!');
          this.addResponseToLocalStorage(res.response);
          this.responseCopy = JSON.stringify(res.response);
          this.response = res.response;
          this.hasResponded = true;
        }
      }, err => {
        this.utils.openSnackBar('An error occurred while recording the response');
      });
    }
  }

  onRatingChanged(rating, questionIndex, answerIndex = null) {
    this.rating = rating;
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.rating;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = rating.toString();
    } else {
      question['answer'] = rating.toString();
    }
  }

  onBinaryAnswerChanged(event, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.binary;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = event.value;
    } else {
      question['answer'] = event.value;

    }
  }

  getOptions(question) {
    if (this.hasResponded) {
      return question.answers;
    } else {
      return question.options;
    }
  }

  getResponseFromLocalStorage(pollId) {
    const responses = JSON.parse(localStorage.getItem('responses')) || [];
    return responses.find(response => response.for === pollId);
  }

  addResponseToLocalStorage(newResponse) {
    const responses = JSON.parse(localStorage.getItem('responses')) || [];
    const index = responses.findIndex(response => response.for === newResponse.for);

    if (index >= 0) {
      responses[index] = newResponse;
    } else {
      responses.push(newResponse);
    }
    localStorage.setItem('responses', JSON.stringify(responses));
  }

  get canVote() {
    let totalOptions = this.poll.questions.reduce((acc, question) => acc + question.options.length, 0);
    // count for questions without any options
    totalOptions += this.poll.questions.filter(question => !question.options.length).length;

    let responsedCount = this.response.questions.reduce((acc, question) => {
      acc += question.answers.filter(answerObj => answerObj.answer).length;
      return acc;
    }, 0);

    // count responses on questions (not options of questions)
    responsedCount += this.response.questions.filter(question => question.answer).length;
    return totalOptions === responsedCount;
  }

  get dirty() {
    return JSON.stringify(this.response) !== this.responseCopy;
  }

  get shouldDisable() {
    return this.poll.status === constants.statusTypes.terminated;
  }

}
