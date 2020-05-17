import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from 'src/app/services/poll.service';
import { StarRatingColor } from 'src/app/star-rating/star-rating.component';
import { Response } from '../response.model';
import { ResponseService } from 'src/app/services/response.service';
import { UtilService } from 'src/app/services/util.service';
import { constants } from 'src/app/app.constants';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import { take } from 'rxjs/operators'
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-view-poll',
  templateUrl: './view-poll.component.html',
  styleUrls: ['./view-poll.component.scss']
})
export class ViewPollComponent implements OnInit {

  @Input()
  response: Response = {
    questions: [],
    for: ''
  };
  responseCopy;

  @Input() poll;
  @Input() hasResponded = false;
  @Input() embeddedPreview = false;

  rating: number = 0;
  starCount: number = 5;
  starColor: StarRatingColor = StarRatingColor.accent;
  starColorP: StarRatingColor = StarRatingColor.primary;
  starColorW: StarRatingColor = StarRatingColor.warn;

  pollId;
  hide = true;
  password = '';
  preview = false;
  responseValid = false;
  passwordRequired = false;
  commentDismissed = false;
  constants = constants;

  constructor(
    private router: Router,
    private pollService: PollService,
    private route: ActivatedRoute,
    private responseService: ResponseService,
    private utils: UtilService,
    public translate: TranslateService
  ) { }

  ngOnInit() {
    if (this.poll) {
      this.preview = true;
      !this.hasResponded && this.setAnswers();
    } else {
      this.route.queryParams.pipe(take(1)).subscribe(params => {
        this.pollId = params['id'];
        if (this.pollId) {
          this.getPoll(this.pollId);
        } else {
          this.router.navigate(['']);
        }
      });
    }
  }

  getPoll(pollId, password = null) {
    this.pollService.getPoll(pollId, password).subscribe(
      (res: any) => {
        if (res.success) {
          this.passwordRequired = false;
          this.poll = res.poll;
          if (this.getResponseFromLocalStorage(this.poll._id)) {
            this.response = this.getResponseFromLocalStorage(this.poll._id);
            this.verifyResponseValidity();
            this.hasResponded = true;
          } else {
            this.setAnswers();
            this.response.for = res.poll._id;
          }
          this.responseCopy = JSON.stringify(this.response);
        } else {
          if (res.passwordRequired) {
            this.passwordRequired = true;
          } else if (res.incorrectPassword) {
            this.utils.openSnackBar('messages.incorrectPassword', 'labels.retry');
          } else {
            this.utils.openSnackBar('errors.e003_gettingPoll');
            this.navigateToRespond();
          }
        }
      },
      (err) => {
        this.utils.openSnackBar('errors.e003_gettingPoll');
        this.navigateToRespond();
      }
    );
  }

  setAnswers() {
    const getDefaultAnswer = (answerType) => {
      switch (answerType) {
        case constants.answerTypes.checkbox:
        case constants.answerTypes.radioButton:
          return false;
        case constants.answerTypes.radioButton:
        case constants.answerTypes.slider:
        case constants.answerTypes.dropdown:
          return 0;
        default:
          return '';
      }
    }
    this.poll.questions.forEach(question => {
      const questionToPush = {
        _id: question._id || null,
        text: question.text,
        answerType: question.answerType,
        answers: []
      };

      if (question.options.length) {
        questionToPush.answers = question.options.map(option => ({ option, answer: getDefaultAnswer(question.answerType) }))
      } else {
        questionToPush['answer'] = getDefaultAnswer(question.answerType);
      }

      if (question.answerType === constants.answerTypes.value) {
        questionToPush['minValue'] = question.minValue;
        questionToPush['maxValue'] = question.maxValue;
        questionToPush['decimalPlaces'] = question.decimalPlaces;
      }

      this.response.questions.push(questionToPush);
    });

    this.poll.allowComments && (this.response['comments'] = '');
    this.poll.allowNames && (this.response['name'] = '');
  }

  vote() {
    delete this.response['updatedAt'];
    delete this.response['createdAt'];
    if (this.hasResponded && this.responseValid) {
      this.responseService.updateResponse(this.response).subscribe((res: any) => {
        if (res.success) {
          this.addResponseToLocalStorage(res.response);
          this.responseCopy = JSON.stringify(res.response);
          this.response = res.response;
          this.navigateToRespond({ action: 'updated', responded: true });
        }
      }, err => {
        this.utils.openSnackBar('errors.e005_updatingResponse');
      });
    } else {
      this.responseService.recordResponse(this.response).subscribe((res: any) => {
        if (res.success) {
          this.addResponseToLocalStorage(res.response);
          this.responseCopy = JSON.stringify(res.response);
          this.response = res.response;
          this.hasResponded = true;
          this.responseValid = true;
          this.navigateToRespond({ action: 'recorded', responded: true });
        }
      }, err => {
        this.utils.openSnackBar('errors.e004_recordingResponse');
      });
    }
  }

  onRatingChanged(rating, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.rating;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = rating.toString();
    } else {
      question['answer'] = rating.toString();
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

  onTextAnswerChanged(event, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.text;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = event.target.value;
    } else {
      question['answer'] = event.target.value;
    }
  }

  dropdownOptionChanged(event, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.dropdown;
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

  goClicked() {
    this.getPoll(this.pollId, this.password);
  }

  navigateToRespond(additionalParams = {}) {
    this.router.navigate(['/respond'], {
      relativeTo: this.route,
      queryParams: {
        id: this.pollId,
        ...additionalParams
      }
   });
  }

  verifyResponseValidity() {
    this.responseService.verifyResponse(this.response['_id']).subscribe(
      (res: any) => {
        if (res.success) {
          this.responseValid = true;
        }
        // old response not found (deleted by asker)
        else {
          this.responseValid = false;
        }
      },
      err => { this.responseValid = false; }
    )
  }

  getParsedDateTime(time = false) {
    const date = this.response['updatedAt'];
    if (date) {
      const format = !time ? 'YYYY-MM-DD' : 'HH:mm';
      return moment(date).format(format);
    } else {
      return '-';
    }
  }

  allowDecimals(question) {
    return +question.decimalPlaces > 0;
  }

  testRegexForValueAnswer(value, question) {
    if (this.allowDecimals(question)) {
      return new RegExp(`^-?[0-9]+(?:\\.[0-9]{${+question.decimalPlaces}})?$`).test(value);
    } else {
      return new RegExp(`^-?[0-9]+$`).test(value);
    }
  }

  valueInputValid(value, question) {
    const regexPassed = this.testRegexForValueAnswer(value, question);
    const isValid = +value >= +question.minValue && +value <= +question.maxValue && regexPassed;
    return isValid;
  }

  valueInputKeydown(currentValue, event, question) {

    const keycodesToBlock = [
      32
    ];

    if (keycodesToBlock.includes(event.keyCode)) {
      return false;
    }

    const allowMinus = +question.minValue < 0  && !currentValue.includes('-');
    const allowPeriod = this.allowDecimals(question) && !currentValue.includes('.');
    const maxDecimalsEntered = currentValue.includes('.') && currentValue.split('.')[1].length === question.decimalPlaces;

    const keycodesToIgnore = [
      8, 37, 39, 46, 9
    ];

    return keycodesToIgnore.includes(event.keyCode)
            || (!maxDecimalsEntered && !isNaN(event.key))
            || (event.key === '-' && allowMinus)
            || (event.key === '.' && allowPeriod);
  }

  getRespondedMessage() {
    return this.translate.instant(
      'messages.respondedPreviously',
      {
        'DT': this.getParsedDateTime(true),
        'TM': this.getParsedDateTime()
      }
    );
  }

  hasGlobalMessage(messageKey) {
    const message = this.translate.instant(`globalMessages.${messageKey}`);
    return message && message !== `globalMessages.${messageKey}`;
  }

  get canVote() {

    const answerTypesToSkip = [
      constants.answerTypes.slider,
      constants.answerTypes.text,
      constants.answerTypes.dropdown
    ];

    const totalOptions = this.poll.questions.reduce((acc, question) => {
      if (!answerTypesToSkip.includes(question.answerType)) {
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
      if (!answerTypesToSkip.includes(question.answerType)) {
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

    return totalOptions === respondedCount && this.valueInputsValid;
  }

  get valueInputsValid() {
    return this.response.questions.filter(
      question => question.answerType === constants.answerTypes.value
    ).every(
      question => {
        if (question.answers.length) {
          return question.answers.every(
            answerObj => {
              return this.valueInputValid(answerObj.answer, question);
            }
          );
        } else {
          return this.valueInputValid(question.answer, question);
        }
      }
    );
  }

  get dirty() {
    return !this.responseValid || JSON.stringify(this.response) !== this.responseCopy;
  }

  get shouldDisable() {
    return this.poll.status === constants.statusTypes.terminated || (this.preview && this.hasResponded ? true : false);
  }

  get isOpen() {
    return this.poll.status === constants.statusTypes.open;
  }

  get isMobile() {
    return DataService.isMobile;
  }
}
