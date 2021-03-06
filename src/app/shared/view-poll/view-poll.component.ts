import { Component, OnInit, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from '../../services/poll.service';
import { StarRatingColor } from '../../shared/star-rating/star-rating.component';
import { Response } from '../../secure/poll/response.model';
import { ResponseService } from '../../services/response.service';
import { UtilService } from '../../services/util.service';
import { constants } from '../../app.constants';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

import { take } from 'rxjs/operators'
import { DataService } from '../../services/data.service';
import { ScrollService } from '../../services/scroll.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-view-poll',
  templateUrl: './view-poll.component.html',
  styleUrls: ['./view-poll.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
  submitted = false;
  constants = constants;
  isPro = true;

  constructor(
    private router: Router,
    private pollService: PollService,
    private route: ActivatedRoute,
    private responseService: ResponseService,
    private utils: UtilService,
    public translate: TranslateService,
    private scrollService: ScrollService,
    private changeDetectorRef: ChangeDetectorRef,
    private userService: UserService
  ) { }

  ngOnInit() {
    if (this.poll) {
      this.scrollService.top();
      this.preview = true;
      !this.hasResponded && this.setAnswers();
      this.isPro = new Date() < new Date(this.userService.getLoggedInUser().subscription.expires);
    } else {
      this.route.firstChild.params.subscribe(params => {
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
          this.isPro = new Date() < new Date(res.poll.createdBy.subscription.expires);
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
            this.utils.openSnackBar('errors.e003_gettingSurvey');
            this.navigateToRespond();
          }
        }
        setTimeout(
          () => { this.changeDetectorRef.detectChanges() }, 10
        );
      },
      (err) => {
        this.utils.openSnackBar('errors.e003_gettingSurvey');
        this.navigateToRespond();
      }
    );
  }

  setAnswers() {
    const getDefaultAnswer = (answerType) => {
      switch (answerType) {
        case constants.answerTypes.checkbox:
        case constants.answerTypes.radioButton:
        case constants.answerTypes.radioButton:
        case constants.answerTypes.slider:
        case constants.answerTypes.dropdown:
          return 0;
        case constants.answerTypes.rating:
        case constants.answerTypes.list:
          return -1;
        default:
          return '';
      }
    }
    this.poll.questions.forEach(question => {
      const questionToPush = {
        _id: question._id || null,
        answerType: question.answerType,
        answers: []
      };

      if (question.options.length) {
        questionToPush.answers = question.options.map(option => ({ answer: getDefaultAnswer(question.answerType) }))
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
    this.submitted = true;

    if (!this.valid) {
      return;
    }

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

  getRatingFromAnswer(answer) {
    switch (answer) {
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
  }

  onRatingChanged(rating, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.rating;
    let answer;
    switch (+rating) {
      case 5:
        answer = 100;
        break;
      case 4:
        answer = 75;
        break;
      case 3:
        answer = 50;
        break;
      case 2:
        answer = 25;
        break;
      case 1:
        answer = 0;
        break;
    }
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = answer;
    } else {
      question['answer'] = answer;
    }
  }

  onCheckboxChanged(event, questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.checkbox;
    const value = event.checked ? 100 : 0;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = value;
    } else {
      question['answer'] = value;
    }
  }

  onRadioButtonChanged(questionIndex, answerIndex = null) {
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.radioButton;
    if (answerIndex !== null) {
      question.answers.forEach((answerObject, index) => {
        if (index !== answerIndex) {
          answerObject.answer = 0;
        } else {
          answerObject.answer = 100;
        }
      })
    } else {
      question['answer'] = 100;
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

  listDropdownOptionChanged(event, questionIndex, answerIndex = null) {
    const elements = this.getListDropdownValues(this.poll.questions[questionIndex]);
    const question = this.response.questions[questionIndex];
    question.answerType = constants.answerTypes.list;
    if (answerIndex !== null) {
      question.answers[answerIndex].answer = elements.indexOf(event.value);
    } else {
      question['answer'] = elements.indexOf(event.value);
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

  valueInputValid(value, question) {
    const testRegexForValueAnswer = (value, question) => {
      if (this.allowDecimals(question)) {
        return new RegExp(`^-?[0-9]+(?:\\.[0-9]{${+question.decimalPlaces}})?$`).test(value);
      } else {
        return new RegExp(`^-?[0-9]+$`).test(value);
      }
    }

    const regexPassed = testRegexForValueAnswer(value, question);
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
        'DT': this.getParsedDateTime(),
        'TM': this.getParsedDateTime(true)
      }
    );
  }

  hasGlobalMessage(messageKey) {
    const message = this.translate.instant(`globalMessages.${messageKey}`);
    return message && message !== `globalMessages.${messageKey}`;
  }

  isResponseQuestionValid(questionIndex) {
    const responseQuestion = this.response.questions[questionIndex];

    switch (responseQuestion.answerType) {
      case constants.answerTypes.slider:
      case constants.answerTypes.text:
      case constants.answerTypes.dropdown:
        return true;

      case constants.answerTypes.checkbox:
        return this.isCheckboxLimitSatisfied(questionIndex);

      case constants.answerTypes.radioButton:
        return responseQuestion.answers.some(answerObj => answerObj.answer);

      case constants.answerTypes.email:
        if (responseQuestion.answers.length) {
          return responseQuestion.answers.every(answerObj => this.emailInputValid(answerObj.answer));
        } else {
          return this.emailInputValid(responseQuestion.answer);
        }

      case constants.answerTypes.value:
        if (responseQuestion.answers.length) {
          return responseQuestion.answers.every(answerObj => this.valueInputValid(answerObj.answer, responseQuestion));
        } else {
          return this.valueInputValid(responseQuestion.answer, responseQuestion);
        }

      case constants.answerTypes.rating:
      case constants.answerTypes.list:
        if (responseQuestion.answers.length) {
          return responseQuestion.answers.every(answerObj => answerObj.answer >= 0);
        } else {
          return responseQuestion.answer >= 0;
        }

      default:
        if (responseQuestion.answers.length) {
          return responseQuestion.answers.every(answerObj => answerObj.answer || answerObj.answer === 0);
        } else {
          return responseQuestion.answer;
        }
    }
  }

  isCheckboxLimitSatisfied(questionIndex) {
    let valid = true;
    const question = this.poll.questions[questionIndex];
    const responseQuestion = this.response.questions[questionIndex];
    if (question.limits) {
      let checked = responseQuestion.answers.filter(answerObj => answerObj.answer).length;
      if (checked < question.limits.minChecks || checked > question.limits.maxChecks) {
        valid = false;
      }
    } else {
      valid = this.response.questions[questionIndex].answers.some(answerObj => answerObj.answer);
    }
    return valid;
  }

  getSelectedRadioDropdownValue(questionIndex) {
    const question = this.response.questions[questionIndex];
    const selectedOptionIndex = question.answers.findIndex(answerObj => answerObj.answer);
    if (selectedOptionIndex !== -1) {
      return this.poll.questions[questionIndex].options[selectedOptionIndex];
    }
  }

  emailInputValid(value) {
    if (!value) {
      return true;
    } else {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(value).toLowerCase());
    }
  }

  getListDropdownValues(question) {
    return [...new Set(question.listElements.split(';').filter(element => element))];
  }

  get valid() {
    let valid = true;
    for (let i = this.response.questions.length - 1; i >= 0; i --) {
      if (!this.isResponseQuestionValid(i)) {
        valid = false;
        break;
      }
    }
    return valid;
  }

  get dirty() {
    return !this.responseValid || JSON.stringify(this.response) !== this.responseCopy;
  }

  get shouldDisable() {
    return this.poll.status === constants.statusTypes.terminated || this.isViewingResponseOfUser;
  }

  get isOpen() {
    return this.poll.status === constants.statusTypes.open;
  }

  get isDeleted() {
    return this.poll.status === constants.statusTypes.deleted;
  }

  get isTerminated() {
    return this.poll.status === constants.statusTypes.terminated;
  }

  get isViewingResponseOfUser() {
    return this.preview && this.hasResponded;
  }

  get isMobile() {
    return DataService.isMobile;
  }
}
