import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from '../../util/shared.service';
import { AccountService } from '../account.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../../interface/user.interface';
import { take } from 'rxjs';

@Component({
  selector: 'app-send-email',
  standalone: false,
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.css',
})
export class SendEmailComponent implements OnInit {
  emailForm: FormGroup = new FormGroup({});
  submitted = false;
  mode: string | undefined;
  errorMessages: string[] = [];

  constructor(
    private accountService: AccountService,
    private sharedService: SharedService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    // this.accountService.user$.pipe(take(1)).subscribe({
    //   next: (user: User | null) => {
    //     console.log('hit1');
    //     if (user) {
    //       this.router.navigateByUrl('/');
    //     } else {
    //       console.log('hit2');

    //       const mode = this.activatedRoute.snapshot.paramMap.get('mode');
    //       if (mode) {
    //         this.mode = mode;
    //         this.initializeForm();
    //       }
    //     }
    //   },
    // });
    const mode = this.activatedRoute.snapshot.paramMap.get('mode');
    console.log(mode);

    if (mode) {
      this.mode = mode;
      this.initializeForm();
    }
  }

  initializeForm() {
    this.emailForm = this.formBuilder.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
          ),
        ],
      ],
    });
  }

  sendEmail() {
    this.submitted = true;
    this.errorMessages = [];
    if (this.emailForm.valid && this.mode) {
      if (this.mode.includes('resend-email-confirmation-link')) {
        this.accountService
          .resendEmailConfirmationLink(this.emailForm.get('email')?.value)
          .subscribe({
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
      } else if (this.mode.includes('forgot-username-or-password')) {
        this.accountService
          .forgotUsernameOrPassword(this.emailForm.get('email')?.value)
          .subscribe({
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

  cancel() {
    this.router.navigateByUrl('/account/login');
  }
}
