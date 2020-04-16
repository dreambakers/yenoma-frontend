import { Component, OnInit, ViewChild } from '@angular/core';
import { constants } from '../../app.constants';
import { MatSort, MatTableDataSource } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { PollService } from 'src/app/services/poll.service';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { ResponseService } from 'src/app/services/response.service';

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
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;

  constructor(private pollService: PollService,
    private userService: UserService,
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
            this.poll = res.responses[0].for;  // poll
            this.poll.allowComments && this.displayedColumns.splice(1, 0, "comments");
            this.responses = res.responses;
            this.dataSource = new MatTableDataSource(this.responses);
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
      )
    });
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

}

