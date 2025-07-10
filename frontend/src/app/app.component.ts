import { Component, OnInit } from '@angular/core';
import { AccountService } from './account/account.service';
import { SharedService } from './util/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(
    private accountService: AccountService,
    private sharedService: SharedService
  ) {}

  private refreshUser() {
    const jwt = this.accountService.getJWT();
    if (jwt) {
      this.accountService.refreshUser(jwt).subscribe({
        next: (_) => {},
        error: (error) => {
          this.accountService.logOut();
          if (error.status === 401) {
            this.sharedService.showNotification(
              false,
              'Account blocked',
              error.error
            );
          }
        },
      });
    } else {
      this.accountService.refreshUser(null).subscribe();
    }
  }

  ngOnInit(): void {
    this.refreshUser();
  }
}
