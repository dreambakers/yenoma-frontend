import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { AuthenticationService } from '../../../services/authentication.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UtilService } from '../../../services/util.service';
import { UserService } from '../../../services/user.service';
import { TranslateService } from '@ngx-translate/core';
import { constants } from '../../../app.constants';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.scss']
})
export class EmailVerificationComponent implements OnInit {
  emailVerificationForm: FormGroup;
  submitted = false;
  constants = constants;
  @Output() emailSent:EventEmitter<Boolean> = new EventEmitter();

  constructor(
    private auth: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private utils: UtilService,
    private translate: TranslateService,
    private userService: UserService) { }

  ngOnInit() {
    if (this.auth.isAuthenticated()) {
      this.router.navigateByUrl('/dashboard/all');
    }
    this.emailVerificationForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  get f() { return this.emailVerificationForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.emailVerificationForm.invalid) {
      return;
    }
    this.userService.requestEmailVerificationToken(this.emailVerificationForm.value.email).subscribe(
      (res: any) => {
        if (res.success) {
          this.emailSent.emit(true);
        } else {
          this.utils.openSnackBar('errors.e019_sendingEmail', 'labels.retry');
        }
    }, (errorResponse: any) => {
      this.utils.openSnackBar('errors.e019_sendingEmail', 'labels.retry');
    });
  }
}