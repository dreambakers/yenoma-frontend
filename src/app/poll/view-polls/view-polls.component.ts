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
import { TranslateService } from '@ngx-translate/core';

import { NgNavigatorShareService } from 'ng-navigator-share';
import { EmitterService } from 'src/app/services/emitter.service';
import { MobileNavbarProps } from 'src/app/footer/footer.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-view-polls',
  templateUrl: './view-polls.component.html',
  styleUrls: ['./view-polls.component.scss']
})
export class ViewPollsComponent implements OnInit, OnDestroy {

  poll;
  dataSource;
  polls = [];
  preview = false;
  constants = constants;
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  displayedColumns: string[] = ['title', 'privateNote', 'createdAt', 'responses', 'status', 'action'];
  currentSort: MatSortable = {
    id: 'createdAt',
    start: 'asc',
    disableClear: true
  }

  constructor(private pollService: PollService,
    private utils: UtilService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private ngNavigatorShareService: NgNavigatorShareService,
    private emitterService: EmitterService
    ) { }

  ngOnInit() {
    this.pollService.getPolls().subscribe(
      (res: any) => {
        if (res.success) {
          this.polls = res.polls;
          this.dataSource = new MatTableDataSource(this.polls);
          setTimeout(() => {
            this.dataSource.sort = this.sort;
            this.sort.sort(this.currentSort);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sortingDataAccessor = (data, header) => data[header];
          });
          this.updateNavbarProps();
          this.updateNavTitle();
        }
      },
      err => {
        this.utils.openSnackBar('messages.errorGettingPoll');
      }
    );
    this.emitterService.emittter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
      switch(emitted.event) {
        case constants.emitterKeys.add:
          return this.addClicked();
        case constants.emitterKeys.arrange:
          return this.openSortDialog();
        case constants.emitterKeys.cancel:
          if (this.preview) {
            this.togglePreview();
          }
      }
    });
  }

  updateNavbarProps(updatedProps: MobileNavbarProps = null) {
    // populate default props incase props not provided
    if (!updatedProps) {
      updatedProps = {
        cancel: false,
        arrange: this.polls.length > 0,
        add: true,
        create: false,
        preview: false
      }
    }
    this.emitterService.emit(constants.emitterKeys.updateNavbarProps, updatedProps);
  }

  updateNavTitle(message = null) {
    const navTitleToSet = message || this.translate.instant('labels.myPolls') + ` (${this.polls.length})`;
    this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, navTitleToSet);
  }

  deletePoll(pollId) {
    this.utils.confirmDialog('messages.areYouSure', 'messages.pollDeletionConfirmation').subscribe(
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
                this.utils.openSnackBar('messages.errorDeletingPoll');
              }
            },
            err => {
              this.utils.openSnackBar('messages.errorDeletingPoll');
            }
          );
        }
      }
    );
  }

  terminatePoll(pollId) {
    this.utils.confirmDialog('messages.areYouSure', 'messages.pollTerminationConfirmation').subscribe(
      res => {
        if (res) {
          this.pollService.terminatePoll(pollId).subscribe(
            (res: any) => {
              if (res.success) {
                const poll = this.polls.find(poll => poll._id === pollId);
                poll.status = constants.statusTypes.terminated;
                this.utils.openSnackBar('messages.pollTerminated');
              } else {
                this.utils.openSnackBar('messages.errorTerminatingPoll');
              }
            },
            err => {
              this.utils.openSnackBar('messages.errorTerminatingPoll');
            }
          );
        }
      }
    );
  }

  restorePoll(pollId) {
    this.utils.confirmDialog('messages.areYouSure', 'messages.pollRestoreConfirmation').subscribe(
      res => {
        if (res) {
          this.pollService.restore(pollId).subscribe(
            (res: any) => {
              if (res.success) {
                const poll = this.polls.find(poll => poll._id === pollId);
                poll.status = constants.statusTypes.open;
                this.utils.openSnackBar('messages.pollRestored');
              } else {
                this.utils.openSnackBar('messages.errorRestoringPoll');
              }
            },
            err => {
              this.utils.openSnackBar('messages.errorRestoringPoll');
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
          this.utils.openSnackBar('messages.errorDuplicatingPoll');
        }
      },
      err => {
        this.utils.openSnackBar('messages.errorDuplicatingPoll');
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
      return this.preview = false;
    }
    this.updateNavTitle(this.translate.instant('labels.poll') + ' ' + this.translate.instant('labels.preview'));
    this.updateNavbarProps({ cancel: true, arrange: false, add: false });
    this.poll = poll;
    this.preview = true;
  }

  addClicked() {
    this.router.navigate(['dashboard/create']);
  }

  openSortDialog() {
    this.utils.sortDialog(
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
          console.log(this.currentSort)
          this.sort.sort(this.currentSort);
        }
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  get isMobile() {
    return DataService.isMobile;
  }
}
