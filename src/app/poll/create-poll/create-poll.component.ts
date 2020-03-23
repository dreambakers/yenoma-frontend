import { Component, OnInit } from '@angular/core';
import { Poll } from '../poll.model';
import { Router } from '@angular/router';
import { PollService } from 'src/app/services/poll.service';
import { UtilService } from 'src/app/services/util.service';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { constants } from 'src/app/app.constants';

@Component({
  selector: 'app-create-poll',
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.scss']
})
export class CreatePollComponent implements OnInit {

  constants = constants;
  poll: Poll = {
    questions: [
      { text: '', options: [], answerType: constants.answerTypes.binary }
    ],
    title: '',
    description: '',
    status: constants.statusTypes.open
  };
  rearrangeQuestions = false;

  constructor(private router: Router, private pollService: PollService, private utils: UtilService) { }

  ngOnInit() {
  }

  createPoll() {
    this.pollService.addPoll(this.poll).subscribe((res: any) => {
      this.utils.openSnackBar('Poll created successfully', 'Great!');
      this.router.navigate(['/dashboard/manage'], { queryParams: { id: res.poll._id } });
    }, err => {
      this.utils.openSnackBar('An error occurred while creating the poll');
    });
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.poll.questions, event.previousIndex, event.currentIndex);
  }


}
