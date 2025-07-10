import { Component, OnInit } from '@angular/core';
import { AccountService } from './account/account.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(private accountService: AccountService) {}

  private refreshUser() {
    const jwt = this.accountService.getJWT();
    if (jwt) {
      this.accountService.refreshUser(jwt).subscribe({
        next: (_) => {},
        error: (_) => {
          this.accountService.logOut();
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
