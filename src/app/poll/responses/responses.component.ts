import { Component, OnInit, ViewChild } from '@angular/core';
import { constants } from '../../app.constants';
import { MatSort } from '@angular/material/sort';
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

  constructor(private pollService: PollService,
    private emitterService: EmitterService,
    private utils: UtilService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private responseService: ResponseService) { }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      const pollId = params['id'];
      this.responseService.getResponsesForPoll(pollId).subscribe(
        (res: any) => {
          if (res.success) {
            this.responses = res.responses;
            this.dataSource = new MatTableDataSource(this.responses);
            this.changeNavbarTitle();
            setTimeout(() => {
              this.dataSource.sort = this.sort;
              this.dataSource.paginator = this.paginator;
              this.dataSource.sortingDataAccessor = (data, header) => data[header];
            });
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

    });
  }

  changeNavbarTitle() {
    const titleToSet = this.translate.instant('pollActions.responseDetails') + ` (${this.responses.length})`;
    this.emitterService.emit(this.constants.emitterKeys.changeNavbarTitle, titleToSet);
  }

  getParsedDate(date) {
    if (date) {
      return moment(date).format('YYYY-MM-DD, HH:mm');
    } else {
      return '-';
    }
  }

  previewPoll(pollId) {
    this.router.navigate(['/dashboard/view'], {
      relativeTo: this.activatedRoute,
      queryParams: {
        id: pollId
      }
   });
  }

  deleteResponse(response) {
    this.utils.confirmDialog('messages.areYouSure', 'messages.deleteResponseConfirmation').subscribe(
      res => {
        if (res) {
          this.responseService.deleteResponse(response._id).subscribe(
            (res: any) => {
              if (res.success) {
                this.responses = this.responses.filter(_response => response._id !== _response._id);
                this.dataSource.data = this.responses;
                this.changeNavbarTitle();
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

  get isMobile() {
    return DataService.isMobile;
  }

}

