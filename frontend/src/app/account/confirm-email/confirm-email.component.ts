import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../util/shared.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../account.service';
import { take } from 'rxjs';
import { User } from '../../interface/user.interface';
import { ConfirmEmail } from '../../interface/account.interface';

@Component({
  selector: 'app-confirm-email',
  standalone: false,
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.css',
})
export class ConfirmEmailComponent implements OnInit {
  success = true;

  constructor(
    private accountService: AccountService,
    private sharedService: SharedService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParamMap.subscribe({
      next: (params: any) => {
        const confirmEmail: ConfirmEmail = {
          token: params.get('token'),
          email: params.get('email'),
        };

        console.log('Confirm email params:', confirmEmail);

        this.accountService.confirmEmail(confirmEmail).subscribe({
          next: (response: any) => {
            this.sharedService.showNotification(
              true,
              response.value.title,
              response.value.message
            );
          },
          error: (error) => {
            this.success = false;
            this.sharedService.showNotification(false, 'Failed', error.error);
          },
        });
      },
    });
  }

  resendEmailConfirmationLink() {
    this.router.navigateByUrl(
      '/account/send-email/resend-email-confirmation-link'
    );
  }
}
