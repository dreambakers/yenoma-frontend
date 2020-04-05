import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from 'src/app/services/poll.service';
import { StarRatingColor } from 'src/app/star-rating/star-rating.component';
import { Response } from '../response.model';
import { ResponseService } from 'src/app/services/response.service';
import { UtilService } from 'src/app/services/util.service';
import { constants } from 'src/app/app.constants';
import { UserService } from 'src/app/services/user.service';

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

  rating: number = 0;
  starCount: number = 5;
  starColor: StarRatingColor = StarRatingColor.accent;
  starColorP: StarRatingColor = StarRatingColor.primary;
  starColorW: StarRatingColor = StarRatingColor.warn;

  hasResponded = false;
  preview = false;

  constants = constants;

  constructor(
    private router: Router,
    private pollService: PollService,
    private route: ActivatedRoute,
    private responseService: ResponseService,
    private utils: UtilService,
    private userService: UserService
  ) {
    this.route.queryParams.subscribe(params => {
      const pollId = params['id'];
      if (pollId) {
        this.preview = !!this.userService.getLoggedInUser();
        const observable = this.preview ? this.pollService.managePoll(pollId) : this.pollService.getPoll(pollId);
        observable.subscribe(
          (res: any) => {
            if (res.success) {
              this.poll = res.poll;
              if (this.getResponseFromLocalStorage(this.poll._id)) {
                this.response = this.getResponseFromLocalStorage(this.poll._id);
                this.hasResponded = true;
              } else {
                const getDefaultAnswer = (answerType) => {
                  switch (answerType) {
                    case constants.answerTypes.checkbox:
                    case constants.answerTypes.radioButton:
                      return false;
                    case constants.answerTypes.radioButton:
                    case constants.answerTypes.slider:
                      return 0;
                    default:
                      return '';
                  }
                }
                this.poll.questions.forEach(question => {
                  this.response.questions.push({
                    _id: question._id,
                    text: question.text,
                    answers: question.options.map(option => ({ option, answer: getDefaultAnswer(question.answerType) })),
                    answerType: question.answerType
                  });
                });
                this.poll.allowComments && (this.response['comments'] = '');
                this.poll.allowNames && (this.response['name'] = '');
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
      } else {
          this.router.navigate(['']);
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

  onYNMAnswerChanged(event, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.yesNoMaybe;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = event.value;
    } else {
      question['answer'] = event.value;
    }
  }

  onSliderValueChanged(event, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.slider;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = event.value;
    } else {
      question['answer'] = event.value;
    }
  }

  onCheckboxChanged(event, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.checkbox;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = event.checked;
    } else {
      question['answer'] = event.checked;
    }
  }

  onRadioButtonChanged(questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.radioButton;
    if (answerIndex !== null) {
      question.answers.forEach((answerObject, index) => {
        if (index !== answerIndex) {
          answerObject.answer = false;
        } else {
          answerObject.answer = true;
        }
      })
    } else {
      question['answer'] = true;
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
    const totalOptions = this.poll.questions.reduce((acc, question) => {
      if (question.answerType !== constants.answerTypes.slider) {
        if (question.options.length) {
          // dont count multiple options for checkbox/radio (since a min of 1 must be selected)
          if ([constants.answerTypes.radioButton, constants.answerTypes.checkbox].includes(question.answerType)) {
            acc += 1;
          } else {
            acc += question.options.length;
          }
        } else {
          acc += 1;
        }
      }
      return acc;
    }, 0);

    const respondedCount = this.response.questions.reduce((acc, question) => {
      if (question.answerType !== constants.answerTypes.slider) {
        if (question.answers.length) {
          if ([
                constants.answerTypes.radioButton,
                constants.answerTypes.checkbox
              ].includes(question.answerType)
              && question.answers.filter(answerObj => answerObj.answer).length) {
            acc ++;
          } else {
            acc += question.answers.filter(answerObj => answerObj.answer).length;
          }
        } else {
          if (question.answer) {
            acc++;
          }
        }
      }
      return acc;
    }, 0);

    return totalOptions === respondedCount;
  }

  get dirty() {
    return JSON.stringify(this.response) !== this.responseCopy;
  }

  get shouldDisable() {
    return this.poll.status === constants.statusTypes.terminated;
  }

  onBackClicked() {
    this.router.navigate(['/dashboard/all']);
  }
}
