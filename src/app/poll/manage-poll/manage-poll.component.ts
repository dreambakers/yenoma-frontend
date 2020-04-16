import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PollService } from 'src/app/services/poll.service';
import { Response } from '../response.model';
import { UtilService } from 'src/app/services/util.service';
import { constants } from 'src/app/app.constants';
import { Poll } from '../poll.model';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@ngx-translate/core';

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

  constructor(
    private router: Router,
    private pollService: PollService,
    private route: ActivatedRoute,
    private utils: UtilService,
    public translate: TranslateService
  ) {}

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
          { text: '', options: [], answerType: constants.answerTypes.binary }
        ],
        title: '',
        status: constants.statusTypes.open,
        allowComments: false,
        allowNames: false
      }
    }
  }

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

  get isValid() {
    return this.poll.title && (this.showPassword ? this.poll.password : true) &&
           this.poll.questions.every(question => question.text && question.options.every(option => option.length)) &&
           this.poll.questions.filter(question => this.minimumOptionsRequired(question)).every(question => question.options.length >= 2);
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
}
