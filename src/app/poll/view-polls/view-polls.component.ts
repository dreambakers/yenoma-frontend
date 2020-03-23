import { Component, OnInit } from '@angular/core';
import { PollService } from 'src/app/services/poll.service';
import { UserService } from 'src/app/services/user.service';
import { UtilService } from 'src/app/services/util.service';
import { constants } from 'src/app/app.constants';

@Component({
  selector: 'app-view-polls',
  templateUrl: './view-polls.component.html',
  styleUrls: ['./view-polls.component.scss']
})
export class ViewPollsComponent implements OnInit {

  polls = [];
  constants = constants;

  constructor(private pollService: PollService,
    private userService: UserService,
    private utils: UtilService) { }

  ngOnInit() {
    this.pollService.getPolls().subscribe(
      (res: any) => {
        if (res.success) {
          this.polls = res.polls;
        }
      },
      err => {
        this.utils.openSnackBar('An error occurred while getting the polls');
      }
    );
  }

  deletePoll(pollId) {
    this.utils.confirmDialog('Are you sure?', 'This will delete the selected poll').subscribe(
      res => {
        if (res) {
          this.pollService.deletePoll(pollId).subscribe(
            (res: any) => {
              if (res.success) {
                this.polls = this.polls.filter(poll => poll._id !== pollId);
                this.utils.openSnackBar('Poll deleted successfully');
              } else {
                this.utils.openSnackBar('An error occurred while deleting the poll');
              }
            },
            err => {
              this.utils.openSnackBar('An error occurred while deleting the poll');
            }
          );
        }
      }
    );
  }

  terminatePoll(pollId) {
    this.utils.confirmDialog('Are you sure?', 'This will terminate the selected poll').subscribe(
      res => {
        if (res) {
          this.pollService.terminatePoll(pollId).subscribe(
            (res: any) => {
              if (res.success) {
                const poll = this.polls.find(poll => poll._id === pollId);
                poll.status = constants.statusTypes.terminated;
                this.utils.openSnackBar('Poll terminated successfully');
              } else {
                this.utils.openSnackBar('An error occurred while terminating the poll');
              }
            },
            err => {
              this.utils.openSnackBar('An error occurred while terminating the poll');
            }
          );
        }
      }
    );
  }

  restorePoll(pollId) {
    this.utils.confirmDialog('Are you sure?', 'This will restore the selected poll').subscribe(
      res => {
        if (res) {
          this.pollService.restore(pollId).subscribe(
            (res: any) => {
              if (res.success) {
                const poll = this.polls.find(poll => poll._id === pollId);
                poll.status = constants.statusTypes.open;
                this.utils.openSnackBar('Poll restored successfully');
              } else {
                this.utils.openSnackBar('An error occurred while restoring the poll');
              }
            },
            err => {
              this.utils.openSnackBar('An error occurred while restoring the poll');
            }
          );
        }
      }
    );
  }

}
