import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../services/authentication.service';
import { PasswordValidation } from '../../helpers/password-validation';
import { Router } from '@angular/router';
import { UtilService } from '../../services/util.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;
  submitted = false;

  constructor(private formBuilder: FormBuilder,
    private auth: AuthenticationService,
    private router: Router,
    private utils: UtilService,
    private userService: UserService) { }

  ngOnInit() {

    this.signupForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
      {
        validator: PasswordValidation.MatchPassword
      });
  }

  get f() { return this.signupForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.signupForm.invalid) {
      return;
    }

    this.auth.authenticateUser(this.signupForm.value.email, this.signupForm.value.password, true).subscribe(
      response => {
        if (response.headers.get('x-auth')) {
          const user = { ...response.body, authToken: response.headers.get('x-auth') };
          this.userService.setLoggedInUser(user);
          this.router.navigateByUrl('/dashboard/create');
        }
      },
      errorResponse => {
        const errorMessageKey = errorResponse.error.alreadyExists ? 'messages.userAlreadyExists' : 'errors.e009_signingUp';
        this.utils.openSnackBar(errorMessageKey, 'labels.retry');
      }
    );
  }

}
