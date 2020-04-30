import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from 'src/app/services/poll.service';
import { Response } from '../response.model';
import { UtilService } from 'src/app/services/util.service';
import { constants } from 'src/app/app.constants';
import { Poll } from '../poll.model';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';
import { DataService } from 'src/app/services/data.service';
import { EmitterService } from 'src/app/services/emitter.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MobileNavbarProps } from 'src/app/footer/footer.component';

@Component({
  selector: 'app-manage-poll',
  templateUrl: './manage-poll.component.html',
  styleUrls: ['./manage-poll.component.scss']
})
export class ManagePollComponent implements OnInit, OnDestroy {

  response: Response = {
    questions: [],
    for: ''
  };

  poll: Poll;
  pollCopy;
  responses;
  answerMap: any;
  hide = true;
  preview = false;
  loading = false;
  isEditing = false;
  submitted = false;
  showPassword = false;
  rearrangeQuestions = false;
  constants = constants;
  mobileNavbarProps: MobileNavbarProps;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private pollService: PollService,
    private route: ActivatedRoute,
    private utils: UtilService,
    public translate: TranslateService,
    private emitterService: EmitterService,
  ) { }

  ngOnInit() {
    this.isEditing = this.route.snapshot.routeConfig.path === 'manage';
    if (this.isEditing) {
      this.route.queryParams.subscribe(params => {
        const pollId = params['id'];
        this.pollService.managePoll(pollId).subscribe(
          (res: any) => {
            if (res.success) {
              this.poll = res.poll;
              this.responses = res.responses;
              this.showPassword = !!this.poll.password;
              this.pollCopy = JSON.stringify(this.poll);
              this.updateMobileNavbar();
            } else {
              this.utils.openSnackBar('messages.errorGettingPoll');
            }
          },
          (err) => {
            this.utils.openSnackBar('messages.errorGettingPoll');
          }
        )
      });
    } else {
      this.poll = {
        questions: [
          { text: '', options: [], answerType: constants.answerTypes.yesNoMaybe }
        ],
        title: '',
        status: constants.statusTypes.open,
        allowComments: false,
        allowNames: false
      }
      this.updateMobileNavbar();
    }
    this.emitterService.emittter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.add:
          return this.addQuestion();
        case constants.emitterKeys.cancel:
          return this.onCancelClicked();
        case constants.emitterKeys.preview:
          return this.preview = !this.preview;
        case constants.emitterKeys.create:
          return this.createPoll();
      }
    });
  }

  updateMobileNavbar() {
    this.mobileNavbarProps = {
      cancel: true ,
      arrange: false,
      add: !this.shouldDisable,
      create: false,
      preview: true
    }
    this.emitterService.emit(constants.emitterKeys.updateNavbarProps, this.mobileNavbarProps);
  }

  createNew() {
    this.router.navigate(['/']);
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.poll.questions, event.previousIndex, event.currentIndex);
  }

  addQuestion() {
    this.poll.questions.push({ text: '', options: [], answerType: constants.answerTypes.yesNoMaybe });
  }

  removeQuestion(questionIndex) {
    this.poll.questions.splice(questionIndex, 1);
    if (!this.poll.questions.length) {
      this.addQuestion();
    }
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

  updatePoll() {
    this.poll.questions.forEach(question => delete question['rearrangeOptions']);
    this.pollService.updatePoll(this.poll).subscribe(
      (res: any) => {
        if (res.success) {
          this.utils.openSnackBar('messages.pollUpdated', 'labels.success');
          this.pollCopy = JSON.stringify(this.poll);
        } else {
          this.utils.openSnackBar('messages.errorUpdatingPoll');
        }
      },
      err => {
        this.utils.openSnackBar('messages.errorUpdatingPoll');
      }
    );
  }

  createPoll() {
    this.pollService.addPoll(this.poll).subscribe((res: any) => {
      this.utils.openSnackBar('messages.pollCreated', 'labels.success');
      this.router.navigate(['/dashboard/manage'], { queryParams: { id: res.poll._id } });
    }, err => {
      this.utils.openSnackBar('messages.errorCreatingPoll');
    });
  }

  dropQuestion(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.poll.questions, event.previousIndex, event.currentIndex);
  }

  dropOption(event: CdkDragDrop<string[]>, question) {
    moveItemInArray(question.options, event.previousIndex, event.currentIndex);
  }

  toggleRearrangement() {
    this.rearrangeQuestions = !this.rearrangeQuestions;
    this.poll.questions.forEach(question => delete question['rearrangeOptions']);
  }

  minimumOptionsRequired(question) {
    return question.answerType === constants.answerTypes.radioButton ||
           question.answerType === constants.answerTypes.checkbox;
  }

  rearrangeOptions(question) {
    if (question['rearrangeOptions']) {
      delete question['rearrangeOptions'];
    } else {
      question['rearrangeOptions'] = true;
    }
  }

  onCancelClicked(){
    const key = this.isEditing ? 'cancelPollEdit' : 'cancelPollCreation';
    this.utils.confirmDialog('messages.areYouSure', `messages.${key}`).subscribe(
      res => {
        if (res) {
          this.router.navigate(['/dashboard/all']);
        }
      }
    );
  }

  togglePassword() {
    this.poll.password = '';
    this.showPassword = !this.showPassword;
  }

  valueFieldsInvalid(question) {
    if (question.answerType === constants.answerTypes.value) {
      return question.minValue === undefined || question.maxValue === undefined || question.decimalPlaces === undefined
             || +question.maxValue < +question.minValue;
    }
    return false;
  }

  questionInfoRequired(question) {
    return this.minimumOptionsRequired(question) || question.answerType === constants.answerTypes.value;
  }

  getInfoTooltip(question) {
    if (this.minimumOptionsRequired(question)) {
      return this.translate.instant('tooltips.minTwoOptions');
    } else {
      return this.translate.instant('tooltips.valueInfo');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  get isValid() {
    const valid = this.poll.title && (this.showPassword ? this.poll.password : true) &&
                  this.poll.questions.every(question => question.text && question.options.every(option => option.length)) &&
                  this.poll.questions.filter(question => this.minimumOptionsRequired(question)).every(question => question.options.length >= 2) &&
                  this.poll.questions.filter(question => question.answerType === constants.answerTypes.value).every(question => !this.valueFieldsInvalid(question));
    if (this.mobileNavbarProps.create !== valid) {
      this.mobileNavbarProps.create = valid;
      this.emitterService.emit(this.constants.emitterKeys.updateNavbarProps, this.mobileNavbarProps);
    }
    return valid;
  }

  get dirty() {
    return JSON.stringify(this.poll) !== this.pollCopy;
  }

  get shouldDisable() {
    if (this.isEditing) {
      return this.poll.status === constants.statusTypes.terminated || this.responses.length > 0;
    } else {
      return false;
    }
  }

  get isMobile() {
    return DataService.isMobile;
  }
}
