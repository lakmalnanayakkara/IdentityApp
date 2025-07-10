import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { AccountService } from '../account/account.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit {
  constructor(
    public accountService: AccountService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.accountService.user$.subscribe((user) => {
      this.cd.detectChanges();
    });
  }

  logOut() {
    this.accountService.logOut();
  }
}
