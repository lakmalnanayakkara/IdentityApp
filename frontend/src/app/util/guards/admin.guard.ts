import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AccountService } from '../../account/account.service';
import { User } from '../../interface/user.interface';
import { SharedService } from '../shared.service';
import { jwtDecode } from 'jwt-decode';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const sharedService = inject(SharedService);
  const router = inject(Router);

  return accountService.user$.pipe(
    map((user: User | null) => {
      if (user) {
        const decodedToken: any = jwtDecode(user.jwt);
        if (decodedToken.role.includes('Admin')) {
          return true;
        }
      }

      sharedService.showNotification(false, 'Admin Area', 'Leave now!');
      router.navigateByUrl('/');

      return false;
    })
  );
};
