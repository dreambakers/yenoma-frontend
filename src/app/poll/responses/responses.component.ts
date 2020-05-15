import { Component, OnInit, ViewChild } from '@angular/core';
import { constants } from '../../app.constants';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { PollService } from 'src/app/services/poll.service';
import { UtilService } from 'src/app/services/util.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ResponseService } from 'src/app/services/response.service';
import { DataService } from 'src/app/services/data.service';
import { EmitterService } from 'src/app/services/emitter.service';
import { MobileNavbarProps } from 'src/app/footer/footer.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DialogService } from 'src/app/services/dialog.service';

@Component({
  selector: 'app-responses',
  templateUrl: './responses.component.html',
  styleUrls: ['./responses.component.scss']
})

export class ResponsesComponent implements OnInit {
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
    private dialogService: DialogService
  ) { }

  ngOnInit() {
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
            this.utils.openSnackBar('messages.errorGettingResponses');
          }
        },
        (err) => {
          this.utils.openSnackBar('messages.errorGettingResponses');
        }
      );

      this.pollService.managePoll(pollId).subscribe(
        (res: any) => {
          if (res.success) {
            this.poll = res.poll;  // poll
            this.poll.allowComments && this.displayedColumns.splice(1, 0, "comments");
          } else {
            this.utils.openSnackBar('messages.errorGettingPoll');
          }
        },
        (err) => {
          this.utils.openSnackBar('messages.errorGettingPoll');
        }
      );

      this.emitterService.emittter.pipe(takeUntil(this.destroy$)).subscribe((emitted) => {
        switch(emitted.event) {
          case constants.emitterKeys.cancel:
              return this.preview ? this.toggleViewResponse() : this.backClicked();
          case constants.emitterKeys.arrange:
            return this.openSortDialog();
        }
      });
    });
  }

  setTableAttributes() {
    setTimeout(() => {
      this.dataSource.sort = this.sort;
      this.sort.sort(this.currentSort);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sortingDataAccessor = (data, header) => data[header];
    });
  }

  updateNavbarProps(updatedProps: MobileNavbarProps = null) {
    // populate default props incase props not provided
    if (!updatedProps) {
      updatedProps = {
        cancel: true,
        arrange: this.responses.length > 0,
        add: false,
        create: false,
        preview: false
      }
    }
    this.emitterService.emit(constants.emitterKeys.updateNavbarProps, updatedProps);
  }

  updateNavTitle(message = null) {
    const titleToSet = message || this.translate.instant('pollActions.responseDetails') + ` (${this.responses.length})`;
    this.emitterService.emit(constants.emitterKeys.changeNavbarTitle, titleToSet);
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
                this.utils.openSnackBar('messages.errorDeletingResponse');
              }
            },
            err => {
              this.utils.openSnackBar('messages.errorDeletingResponse');
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
          this.utils.openSnackBar('messages.errorGettingResponse');
        }
      },
      err => {
        this.utils.openSnackBar('messages.errorGettingResponse');
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
    } else {
      this.responseService.getResponse(response._id).subscribe(
        (res: any) => {
          if (res.success) {
            this.response = res.response;
            this.preview = true;
            this.updateNavbarProps({ arrange: false });
            this.updateNavTitle(this.translate.instant('labels.response'));
          } else {
            this.utils.openSnackBar('messages.errorGettingResponse');
          }
        },
        err => {
          this.utils.openSnackBar('messages.errorGettingResponse');
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

  ngOnDestroy(): void {
    this.emitterService.emit(this.constants.emitterKeys.resetNavbar);
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  get isMobile() {
    return DataService.isMobile;
  }

}

