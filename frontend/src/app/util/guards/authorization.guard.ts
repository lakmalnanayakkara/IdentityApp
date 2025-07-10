import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountService } from '../../account/account.service';
import { SharedService } from '../shared.service';
import { map } from 'rxjs';
import { User } from '../../interface/user.interface';

export const authorizationGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const sharedService = inject(SharedService);
  const router = inject(Router);

  return accountService.user$.pipe(
    map((user: User | null) => {
      if (user) {
        return true;
      } else {
        sharedService.showNotification(
          true,
          'Restricted Area',
          'Leave Immediately'
        );
        router.navigate(['account/login'], {
          queryParams: { returnUrl: state.url },
        });
        return false;
      }
    })
  );
};
