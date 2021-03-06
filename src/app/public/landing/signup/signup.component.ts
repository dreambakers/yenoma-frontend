import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../services/authentication.service';
import { PasswordValidation } from '../../../shared/utils/password-validation';
import { Router } from '@angular/router';
import { UtilService } from '../../../services/util.service';
import { UserService } from '../../../services/user.service';
import { constants } from '../../../app.constants';
import { EmitterService } from 'src/app/services/emitter.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;
  submitted = false;
  constants = constants;
  loading = false;
  @Output() signupEvent = new EventEmitter();

  constructor(
    private formBuilder: FormBuilder,
    private auth: AuthenticationService,
    private router: Router,
    private utils: UtilService,
    private userService: UserService,
    private emitterService: EmitterService
  ) { }

  ngOnInit() {

    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]+$'), Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      ppAccepted: [false, [Validators.requiredTrue]],
      termsAccepted: [false, [Validators.requiredTrue]]
    },
      {
        validator: PasswordValidation.MatchPassword
      });
  }

  get f() { return this.signupForm.controls; }

  termsAndConditions() {
    this.emitterService.emit(constants.emitterKeys.termsAndConditionsClicked);
  }

  onSubmit() {
    this.submitted = true;

    if (this.signupForm.invalid) {
      return;
    }

    const user = {
      email: this.signupForm.value.email,
      password: this.signupForm.value.password,
      username: this.signupForm.value.username
    }

    this.loading = true;
    this.auth.authenticateUser(user, true).subscribe(
      (res: any) => {
        this.loading = false;
        if (res.body.success) {
          this.router.navigate(['']);
          this.signupEvent.emit({ signupSuccess: true });
        } else {
          this.utils.openSnackBar('errors.e009_signingUp', 'labels.retry');
        }
      },
      errorResponse => {
        this.loading = false;
        if (errorResponse.error.alreadyExists) {
          if (errorResponse.error.username) {
            this.signupForm.controls['username'].setErrors({'usernameExists': true});
          }
          if (errorResponse.error.email) {
            this.signupForm.controls['email'].setErrors({'emailExists': true});
          }
          return;
        }
        this.utils.openSnackBar('errors.e009_signingUp', 'labels.retry');
      }
    );
  }

}
