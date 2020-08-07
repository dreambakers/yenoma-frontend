import { Component, OnInit, ViewChild, OnDestroy, HostListener } from '@angular/core';
import { PollService } from '../../../services/poll.service';
import { UserService } from '../../../services/user.service';
import { UtilService } from '../../../services/util.service';
import { DataService } from '../../../services/data.service';

import { constants } from '../../../app.constants';

import * as moment from 'moment';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { NgNavigatorShareService } from 'ng-navigator-share';
import { EmitterService } from '../../../services/emitter.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DialogService } from '../../../services/dialog.service';
import { Poll } from '../poll.model';
import { ResponseService } from '../../../services/response.service';
import { Stats } from '../../../shared/utils/calculate-stats';
import { NewFile } from '../../../shared/utils/download-file';
import { ScrollService } from '../../../services/scroll.service';
import { MobileNavbarProps } from '../../mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-view-polls',
  templateUrl: './view-polls.component.html',
  styleUrls: ['./view-polls.component.scss']
})
export class ViewPollsComponent implements OnInit, OnDestroy {

  poll;
  dataSource;
  polls: Poll[] = [];
  preview = false;
  constants = constants;
  containsTerminated = false;
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  displayedColumns: string[] = ['title', 'privateNote', 'createdAt', 'terminatedAt', 'responses', 'status', 'action'];
  currentSort: MatSortable = {
    id: 'createdAt',
    start: 'asc',
    disableClear: true
  }
  subscription; // user's subscription
  user;

  constructor(private pollService: PollService,
    private utils: UtilService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private emitterService: EmitterService,
    private dialogService: DialogService,
    private userService: UserService,
    private responseService: ResponseService,
    private scrollService: ScrollService
    ) { }

  ngOnInit() {
    this.user = this.userService.getLoggedInUser();
    this.scrollService.top();
    this.currentSort = { ...this.currentSort, ...this.userService.getPreference('viewSurveysSorting') };
    this.pollService.getPolls().subscribe(
      (res: any) => {
        if (res.success) {
          this.polls = res.polls;
          this.dataSource = new MatTableDataSource(this.polls);
          this.setTableAttributes();
          this.updateNavbarProps();
          this.updateNavTitle();
          this.emitterService.emit(this.constants.emitterKeys.updateNavbarLabels, { arrange: 'labels.sort' });
        }
      },
      err => {
        if (err.status !== 401) {
          this.utils.openSnackBar('errors.e016_gettingSurveys');
        }
      }
    );
    this.userService.getSubscription().subscribe(
      (res: any) => {
        if (res.success) {
          this.subscription = res.subscription;
        }
      }
    );
    this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.add:
          return this.addClicked();
        case constants.emitterKeys.arrange:
          return this.openSortDialog();
        case constants.emitterKeys.preview:
          return this.togglePreview();
        case constants.emitterKeys.screeenSizeChanged:
          this.setPaginator();
      }
    });
    this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(
      (event: LangChangeEvent) => {
        this.updatePaginatorLabels();
      }
    );
  }

  setPaginator() {
    this.dataSource.paginator = !this.isMobile ? this.paginator : null;
  }

  updatePaginatorLabels() {
    if (!this.isMobile && this.dataSource) {
      this.paginator._intl.itemsPerPageLabel = this.translate.instant('labels.surveysPerPage');
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length == 0 || pageSize == 0) {
          return `0 ${this.translate.instant('labels.of')} ${length}`;
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return `${startIndex + 1} - ${endIndex} ${this.translate.instant('labels.of')} ${length}`;
      };
      this.dataSource.paginator = this.paginator;
    }
  }

  setTableAttributes() {
    setTimeout(() => {
      this.dataSource.sort = this.sort;
      this.sort.sort(this.currentSort);
      this.setPaginator()
      this.dataSource.sortingDataAccessor = (data, header) => data[header];
      this.updatePaginatorLabels();
    });
  }

  updateNavbarProps(updatedProps: MobileNavbarProps = null) {
    // populate default props incase props not provided
    if (!updatedProps) {
      updatedProps = {
        home: false,
        arrange: this.polls.length >= 2,
        add: true,
        create: false,
        preview: false
      }
    }
    this.emitterService.emit(constants.emitterKeys.updateNavbarProps, updatedProps);
  }

  updateNavTitle(messageKey = null) {
    if (messageKey) {
      this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, {
        key: messageKey,
        extra: null
      });
    } else {
      this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, {
        key: 'labels.mySurveys',
        extra: ` (${this.polls.length})`
      });
    }
  }

  deletePoll(pollId) {
    this.dialogService.confirm('messages.areYouSure', 'messages.surveyDeletionConfirmation').subscribe(
      res => {
        if (res) {
          this.pollService.deletePoll(pollId).subscribe(
            (res: any) => {
              if (res.success) {
                this.polls = this.polls.filter(poll => poll._id !== pollId);
                this.dataSource.data = this.polls;
                this.utils.openSnackBar('messages.surveyDeletedSuccessfully');
                this.updateNavTitle();
                this.updateNavbarProps();
              } else {
                this.utils.openSnackBar('errors.e006_deletingSurvey');
              }
            },
            err => {
              this.utils.openSnackBar('errors.e006_deletingSurvey');
            }
          );
        }
      }
    );
  }

  terminatePoll(pollId) {
    this.dialogService.confirm('messages.areYouSure', 'messages.surveyTerminationConfirmation').subscribe(
      res => {
        if (res) {
          this.pollService.terminatePoll(pollId).subscribe(
            (res: any) => {
              if (res.success) {
                let pollIndex = this.polls.findIndex(poll => poll._id === pollId);
                this.polls[pollIndex] = JSON.parse(JSON.stringify(res.poll));
                this.dataSource.data = this.polls;
                this.utils.openSnackBar('messages.surveyTerminated');
              } else {
                this.utils.openSnackBar('errors.e007_terminatingSurvey');
              }
            },
            err => {
              this.utils.openSnackBar('errors.e007_terminatingSurvey');
            }
          );
        }
      }
    );
  }

  restorePoll(pollId) {
    this.dialogService.confirm('messages.areYouSure', 'messages.surveyRestoreConfirmation').subscribe(
      res => {
        if (res) {
          this.pollService.restore(pollId).subscribe(
            (res: any) => {
              if (res.success) {
                let pollIndex = this.polls.findIndex(poll => poll._id === pollId);
                this.polls[pollIndex] = JSON.parse(JSON.stringify(res.poll));
                this.dataSource.data = this.polls;
                this.utils.openSnackBar('messages.surveyRestored');
              } else {
                this.utils.openSnackBar('errors.e008_restoringSurvey');
              }
            },
            err => {
              this.utils.openSnackBar('errors.e008_restoringSurvey');
            }
          );
        }
      }
    );
  }

  getParsedDate(date) {
    if (date) {
      return moment(date).format('YYYY-MM-DD, HH:mm');
    } else {
      return '-';
    }
  }

  managePoll(pollId) {
    this.router.navigate(['/dashboard/manage'], {
      relativeTo: this.activatedRoute,
      queryParams: {
        id: pollId
      }
   });
  }

  viewStats(pollId) {
    this.router.navigate(['/dashboard/stats'], {
      relativeTo: this.activatedRoute,
      queryParams: {
        id: pollId
      }
   });
  }

  viewPollResponses(pollId) {
    this.router.navigate(['/dashboard/responses'], {
      relativeTo: this.activatedRoute,
      queryParams: {
        id: pollId
      }
   });
  }

  duplicatePoll(pollId) {
    this.pollService.duplicate(pollId).subscribe(
      (res: any) => {
        if (res.success) {
          this.polls.push(res.poll);
          this.dataSource.data = this.polls;
          this.updateNavbarProps();
          this.utils.openSnackBar('messages.surveyDuplicated');
          this.updateNavTitle();
        } else {
          this.utils.openSnackBar('errors.e014_duplicatingSurvey');
        }
      },
      err => {
        this.utils.openSnackBar('errors.e014_duplicatingSurvey');
      }
    );
  }

  sharePoll(poll) {
    this.dialogService.share(poll);
  }

  togglePreview(poll = null) {
    if (this.preview) {
      this.updateNavTitle();
      this.updateNavbarProps();
      this.emitterService.emit(this.constants.emitterKeys.highlightKeys, { preview: false });
      this.setTableAttributes();
      this.preview = false;
      setTimeout(() => {
        this.scrollService.restore();
      }, 0);
      return;
    }
    this.scrollService.saveCurrent();
    this.updateNavTitle('labels.surveyPreview');
    this.updateNavbarProps({ preview: true, arrange: false, add: false });
    this.emitterService.emit(this.constants.emitterKeys.highlightKeys, { preview: true });
    this.poll = poll;
    this.preview = true;
  }

  addClicked() {
    this.router.navigate(['dashboard/create']);
  }

  openSortDialog() {
    this.dialogService.sort(
      [
        'title',
        'createdAt',
        'responses'
      ],
      this.currentSort
    ).subscribe(
      result => {
        if (result) {
          this.currentSort = result;
          this.sort.sort(this.currentSort);
        }
      }
    );
  }

  downloadResponses(poll) {
    if (!this.subscription.isPro) {
      return this.dialogService.upgrade().subscribe();
    }
    const addNameOrTimeColumn = (data) => {
      if (poll.allowNames) {
        data += '"";';
      }
      if (poll.allowComments){
        data += '"";';
      }
      return data;
    }

    const getFirstRow = () => {
      let data = `"${moment(Date.now()).format('YYYY-MM-DD')}";"${moment(Date.now()).format('HH:mm:ss')}";`;
      data = addNameOrTimeColumn(data);
      for (let question of poll.questions) {
        if (question.options.length) {
          for (let option of question.options) {
            data += `"${question.text}";`;
            // For text question type we need two columns, one for the weight and the other for the actual answer
            // This is why whenever we encounter a text answer type, we would need to manually append another column
            if ([constants.answerTypes.text, constants.answerTypes.email].includes(question.answerType)) {
              data += `"${question.text}";`;
            }
          }
          if (question.allowOtherAnswer) {
            data += `"${question.text}";`;
          }
        } else {
          data += `"${question.text}";`;
          if ([constants.answerTypes.text, constants.answerTypes.email].includes(question.answerType)) {
            data += `"${question.text}";`;
          }
        }
      }
      return data + '\n';
    }

    const getSecondRow = () => {
      let data = '"";"";';
      data = addNameOrTimeColumn(data);
      for (let question of poll.questions) {
        if (question.options.length) {
          for (let option of question.options) {
            data += `"${option}";`;
            if ([constants.answerTypes.text, constants.answerTypes.email].includes(question.answerType)) {
              data += `"${option} [Text]";`;
            }
          }
          if (question.allowOtherAnswer) {
            data += `"${question.options[question.options.length - 1]} [Text]";`
          }
        } else {
          data += `"";`;
          if ([constants.answerTypes.text, constants.answerTypes.email].includes(question.answerType)) {
            data += `"";`;
          }
        }
      }
      return data + '\n';
    }

    const getThirdRow = () => {
      let data = `"Date";"Time";`;

      if (poll.allowNames) {
        data += '"Name";'
      }

      if (poll.allowComments) {
        data += '"Comment";'
      }

      for (let i = 0; i < poll.questions.length; i ++) {
        const question = poll.questions[i];
        if (question.options.length) {
          for (let j = 0; j < question.options.length; j ++) {
            data += `"Q${i + 1}O${j + 1}";`
            if ([constants.answerTypes.text, constants.answerTypes.email].includes(question.answerType)) {
              data += `"Q${i + 1}O${j + 1}T";`
            }
          }
          if (question.allowOtherAnswer) {
            data += `"Q${i + 1}O${question.options.length}T";`
          }
        } else {
          data += `"Q${i + 1}";`
          if ([constants.answerTypes.text, constants.answerTypes.email].includes(question.answerType)) {
            data += `"Q${i + 1}T";`
          }
        }
      }

      return data += '\n';
    }

    const getResponsesRows = (responses) => {
      const stats = new Stats(responses);
      let data = '';

      for (let i = 0; i < responses.length; i ++) {
        const response = responses[i];
        data += `"${moment(response.createdAt).format('YYYY-MM-DD')}";`;
        data += `"${moment(response.createdAt).format('HH:mm:ss')}";`;

        if (poll.allowNames) {
          data += `"${response.name}";`
        }

        if (poll.allowComments) {
          data += `"${response.comments}";`
        }

        for (let j = 0; j < response.questions.length; j++) {

          const question = response.questions[j];
          const weightFunction = stats.getWeightFunctionForAnswer(question.answerType);

          if (question.answers.length) {

            for (let k = 0; k < question.answers.length; k ++) {
              let answerValue = weightFunction(question.answers[k].answer);
              // change index to user-friendly form (i.e. 0 -> 1, 1-> 2, ...) in case of list answer
              if (question.answerType === constants.answerTypes.list) { answerValue += 1 };
              data += `"${answerValue}";`;

              if ([constants.answerTypes.text, constants.answerTypes.email].includes(question.answerType)) {
                data += `"${question.answers[k].answer}";`
              }
            }

            if (poll.questions[j].allowOtherAnswer) {
              data += `"${question.otherAnswer || ''}";`;
            }

          } else {
            let answerValue = weightFunction(question.answer);
            // change index to user-friendly form (i.e. 0 -> 1, 1-> 2, ...) in case of list answer
            if (question.answerType === constants.answerTypes.list) { answerValue += 1 };
            data += `"${answerValue}";`;

            if ([constants.answerTypes.text, constants.answerTypes.email].includes(question.answerType)) {
              data += `"${question.answer}";`
            }
          }
        }

        data += '\n';
      }
      return data;
    }

    this.responseService.getResponsesForPoll(poll._id).subscribe(
      (res: any) => {
        if (res.success) {
          let data = '';
          data += getFirstRow();
          data += getSecondRow();
          data += getThirdRow();
          data += getResponsesRows(res.responses);
          new NewFile(data, poll.shortId + '.csv').download();
        } else {
          this.utils.openSnackBar('errors.e011_gettingResponses');
        }
      },

      (err) => {
        this.utils.openSnackBar('errors.e011_gettingResponses');
      }
    );
  }

  ngOnDestroy(): void {
    this.emitterService.emit(this.constants.emitterKeys.resetNavbar);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  sortChanged($event: { active: string, direction: string }) {
    this.userService.updatePreference({ viewSurveysSorting: { id: $event.active, start: $event.direction } });
  }

  get isMobile() {
    return DataService.isMobile;
  }
}
