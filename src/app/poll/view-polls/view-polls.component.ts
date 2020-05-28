import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { PollService } from 'src/app/services/poll.service';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';
import { DataService } from 'src/app/services/data.service';

import { constants } from 'src/app/app.constants';

import * as moment from 'moment';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';

import { NgNavigatorShareService } from 'ng-navigator-share';
import { EmitterService } from 'src/app/services/emitter.service';
import { MobileNavbarProps } from 'src/app/footer/footer.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';
import { Poll } from '../poll.model';
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

  constructor(private pollService: PollService,
    private utils: UtilService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private emitterService: EmitterService,
    private dialogService: DialogService,
    private userService: UserService
    ) { }

  ngOnInit() {
    this.currentSort = { ...this.currentSort, ...this.userService.getPreference('viewPollsSorting') };
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
        this.utils.openSnackBar('errors.e003_gettingPoll');
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
      this.paginator._intl.itemsPerPageLabel = this.translate.instant('labels.pollsPerPage');
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
        arrange: this.polls.length > 0,
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
        key: 'labels.myPolls',
        extra: ` (${this.polls.length})`
      });
    }
  }

  deletePoll(pollId) {
    this.dialogService.confirm('messages.areYouSure', 'messages.pollDeletionConfirmation').subscribe(
      res => {
        if (res) {
          this.pollService.deletePoll(pollId).subscribe(
            (res: any) => {
              if (res.success) {
                this.polls = this.polls.filter(poll => poll._id !== pollId);
                this.dataSource.data = this.polls;
                this.utils.openSnackBar('messages.pollDeletedSuccessfully');
                this.updateNavTitle();
              } else {
                this.utils.openSnackBar('errors.e006_deletingPoll');
              }
            },
            err => {
              this.utils.openSnackBar('errors.e006_deletingPoll');
            }
          );
        }
      }
    );
  }

  terminatePoll(pollId) {
    this.dialogService.confirm('messages.areYouSure', 'messages.pollTerminationConfirmation').subscribe(
      res => {
        if (res) {
          this.pollService.terminatePoll(pollId).subscribe(
            (res: any) => {
              if (res.success) {
                console.log(res)
                let pollIndex = this.polls.findIndex(poll => poll._id === pollId);
                this.polls[pollIndex] = JSON.parse(JSON.stringify(res.poll));
                this.dataSource.data = this.polls;
                this.utils.openSnackBar('messages.pollTerminated');
              } else {
                this.utils.openSnackBar('errors.e007_terminatingPoll');
              }
            },
            err => {
              this.utils.openSnackBar('errors.e007_terminatingPoll');
            }
          );
        }
      }
    );
  }

  restorePoll(pollId) {
    this.dialogService.confirm('messages.areYouSure', 'messages.pollRestoreConfirmation').subscribe(
      res => {
        if (res) {
          this.pollService.restore(pollId).subscribe(
            (res: any) => {
              if (res.success) {
                let pollIndex = this.polls.findIndex(poll => poll._id === pollId);
                this.polls[pollIndex] = JSON.parse(JSON.stringify(res.poll));
                this.dataSource.data = this.polls;
                this.utils.openSnackBar('messages.pollRestored');
              } else {
                this.utils.openSnackBar('errors.e008_restoringPoll');
              }
            },
            err => {
              this.utils.openSnackBar('errors.e008_restoringPoll');
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
          this.utils.openSnackBar('messages.pollDuplicated');
          this.updateNavTitle();
        } else {
          this.utils.openSnackBar('errors.e014_duplicatingPoll');
        }
      },
      err => {
        this.utils.openSnackBar('errors.e014_duplicatingPoll');
      }
    );
  }

  sharePoll(poll) {
    const pollUrl = window.location.origin + `/p?id=${poll.shortId}`;
    this.ngNavigatorShareService.share({
      title: this.translate.instant('messages.sharePollTitle'),
      text: this.translate.instant('messages.sharePoll'),
      url: pollUrl,
    })
    .catch((error) => {
      this.copyMessage(pollUrl);
      this.utils.openSnackBar('messages.pollLinkCopied');
    });
  }

  copyMessage(val: string){
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  togglePreview(poll = null) {
    if (this.preview) {
      this.updateNavTitle();
      this.updateNavbarProps();
      this.emitterService.emit(this.constants.emitterKeys.highlightKeys, { preview: false });
      this.setTableAttributes();
      return this.preview = false;
    }
    this.updateNavTitle('labels.pollPreview');
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

  ngOnDestroy(): void {
    this.emitterService.emit(this.constants.emitterKeys.resetNavbar);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  sortChanged($event: { active: string, direction: string }) {
    this.userService.updatePreference({ viewPollsSorting: { id: $event.active, start: $event.direction } });
  }

  get isMobile() {
    return DataService.isMobile;
  }
}
