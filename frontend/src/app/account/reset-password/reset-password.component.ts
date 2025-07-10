import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../util/shared.service';
import { AccountService } from '../account.service';
import { take } from 'rxjs';
import { User } from '../../interface/user.interface';
import { ResetPassword } from '../../interface/account.interface';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup = new FormGroup({});
  token: string | undefined;
  email: string | undefined;
  submitted = false;
  errorMessages: string[] = [];

  constructor(
    private accountService: AccountService,
    private sharedService: SharedService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    // this.accountService.user$.pipe(take(1)).subscribe({
    //   next: (user: User | null) => {
    //     if (user) {
    //       this.router.navigateByUrl('/');
    //     } else {
    this.activatedRoute.queryParamMap.subscribe({
      next: (params: any) => {
        this.token = params.get('token');
        this.email = params.get('email');

        if (this.token && this.email) {
          this.initializeForm(this.email);
        } else {
          this.router.navigateByUrl('/account/login');
        }
      },
    });
    //     }
    //   },
    // });
  }

  initializeForm(username: string) {
    this.resetPasswordForm = this.formBuilder.group({
      email: [{ value: username, disabled: true }],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
        ],
      ],
    });
  }

  resetPassword() {
    this.submitted = true;
    this.errorMessages = [];
    console.log('hi');

    if (this.resetPasswordForm.valid && this.token && this.email) {
      const resetPassword: ResetPassword = {
        token: this.token,
        email: this.email,
        newPassword: this.resetPasswordForm.get('newPassword').value,
      };

      this.accountService.resetPassword(resetPassword).subscribe({
        next: (response: any) => {
          this.sharedService.showNotification(
            true,
            response.value.title,
            response.value.message
          );
          this.router.navigateByUrl('/account/login');
        },
        error: (err) => {
          if (err.error.errors) {
            this.errorMessages = err.error.errors;
          } else {
            this.errorMessages.push(err.error);
          }
        },
      });
    }
  }
}
