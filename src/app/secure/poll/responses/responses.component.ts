import { Component, OnInit, ViewChild } from '@angular/core';
import { constants } from '../../../app.constants';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { PollService } from '../../../services/poll.service';
import { UtilService } from '../../../services/util.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import * as moment from 'moment';
import { ResponseService } from '../../../services/response.service';
import { DataService } from '../../../services/data.service';
import { EmitterService } from '../../../services/emitter.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DialogService } from '../../../services/dialog.service';
import { UserService } from '../../../services/user.service';
import { MobileNavbarProps } from '../../mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.scss']
})

export class ResponsesComponent implements OnInit {
  user;
  poll;
  response;
  preview = false;
  responses = [];
  constants = constants;
  displayedColumns: string[] = ['name', 'createdAt', 'view', 'delete'];
  dataSource;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  currentSort: MatSortable = {
    id: 'createdAt',
    start: 'asc',
    disableClear: true
  }
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private pollService: PollService,
    private emitterService: EmitterService,
    private utils: UtilService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private responseService: ResponseService,
    private dialogService: DialogService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.user = this.userService.getLoggedInUser();
    this.currentSort = { ...this.currentSort, ...this.userService.getPreference('responsesSorting') };
    this.activatedRoute.queryParams.subscribe(params => {
      const pollId = params['id'];
      this.responseService.getResponsesForPoll(pollId).subscribe(
        (res: any) => {
          if (res.success) {
            this.responses = res.responses;
            this.dataSource = new MatTableDataSource(this.responses);
            this.updateNavbarProps();
            this.updateNavTitle();
            this.emitterService.emit(this.constants.emitterKeys.updateNavbarLabels, { arrange: 'labels.sort' });
            this.setTableAttributes();
          } else {
            this.utils.openSnackBar('errors.e011_gettingResponses');
          }
        },
        (err) => {
          this.utils.openSnackBar('errors.e011_gettingResponses');
        }
      );

      this.pollService.managePoll(pollId).subscribe(
        (res: any) => {
          if (res.success) {
            this.poll = res.poll;  // poll
            this.poll.allowComments && this.displayedColumns.splice(1, 0, "comments");
          } else {
            this.utils.openSnackBar('errors.e003_gettingSurvey');
          }
        },
        (err) => {
          this.utils.openSnackBar('errors.e003_gettingSurvey');
        }
      );

      this.emitterService.emitter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
        switch(emitted.event) {
          case constants.emitterKeys.home:
              return this.backClicked();
          case constants.emitterKeys.arrange:
            return this.openSortDialog();
          case constants.emitterKeys.preview:
            return this.toggleViewResponse();
        }
      });
      this.translate.onLangChange.pipe(takeUntil(this.destroy$)).subscribe(
        (event: LangChangeEvent) => {
          this.updatePaginatorLabels();
        }
      );
    });
  }

  updatePaginatorLabels() {
    if (!this.isMobile && this.dataSource) {
      this.paginator._intl.itemsPerPageLabel = this.translate.instant('labels.responsesPerPage');
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
      this.dataSource.paginator = this.paginator;
      this.dataSource.sortingDataAccessor = (data, header) => data[header];
      this.updatePaginatorLabels();
    });
  }

  updateNavbarProps(updatedProps: MobileNavbarProps = null) {
    // populate default props incase props not provided
    if (!updatedProps) {
      updatedProps = {
        home: true,
        arrange: this.responses.length > 0,
        add: false,
        create: false,
        preview: false
      }
    }
    this.emitterService.emit(constants.emitterKeys.updateNavbarProps, updatedProps);
  }

  updateNavTitle(messageKey = null) {
    if (messageKey) {
      this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, { key: messageKey, extra: null });
    } else {
      this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, {
        key: 'surveyActions.responseDetails',
        extra: ` (${this.responses.length})`
      });
    }
  }

  getParsedDate(date) {
    if (date) {
      return moment(date).format('YYYY-MM-DD, HH:mm');
    } else {
      return '-';
    }
  }

  deleteResponse(response) {
    this.dialogService.confirm('messages.areYouSure', 'messages.deleteResponseConfirmation').subscribe(
      res => {
        if (res) {
          this.responseService.deleteResponse(response._id).subscribe(
            (res: any) => {
              if (res.success) {
                this.responses = this.responses.filter(_response => response._id !== _response._id);
                this.dataSource.data = this.responses;
                this.updateNavTitle();
                this.utils.openSnackBar('messages.responseDeleted');
              } else {
                this.utils.openSnackBar('errors.e012_deletingResponse');
              }
            },
            err => {
              this.utils.openSnackBar('errors.e012_deletingResponse');
            }
          );
        }
      }
    );
  }

  viewResponse(response) {
    this.responseService.getResponse(response._id).subscribe(
      (res: any) => {
        if (res.success) {
          this.response = res.response;
          this.preview = true;
        } else {
          this.utils.openSnackBar('errors.e013_gettingResponse');
        }
      },
      err => {
        this.utils.openSnackBar('errors.e013_gettingResponse');
      }
    );
  }

  backClicked() {
    this.router.navigate(['dashboard/all']);
  }

  toggleViewResponse(response = null) {
    if (this.preview) {
      this.updateNavTitle();
      this.updateNavbarProps();
      this.setTableAttributes();
      this.preview = false;
      this.emitterService.emit(this.constants.emitterKeys.highlightKeys, { preview: false });
    } else {
      this.responseService.getResponse(response._id).subscribe(
        (res: any) => {
          if (res.success) {
            this.response = res.response;
            this.preview = true;
            this.emitterService.emit(this.constants.emitterKeys.highlightKeys, { preview: true });
            this.updateNavbarProps({ arrange: false, preview: true });
            this.updateNavTitle('labels.response');
          } else {
            this.utils.openSnackBar('errors.e013_gettingResponse');
          }
        },
        err => {
          this.utils.openSnackBar('errors.e013_gettingResponse');
        }
      );
    }
  }

  openSortDialog() {
    this.dialogService.sort(
      [
        'name',
        'createdAt',
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

  sortChanged($event: { active: string, direction: string }) {
    this.userService.updatePreference({ responsesSorting: { id: $event.active, start: $event.direction } });
  }

  ngOnDestroy(): void {
    this.emitterService.emit(this.constants.emitterKeys.resetNavbar);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  get isMobile() {
    return DataService.isMobile;
  }

}

