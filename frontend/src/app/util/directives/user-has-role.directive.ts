import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { take } from 'rxjs';
import { AccountService } from '../../account/account.service';
import { jwtDecode } from 'jwt-decode';

@Directive({
  selector: '[appUserHasRole]',
  standalone: false,
})
export class UserHasRoleDirective {
  @Input() appUserHasRole: string[] = [];

  constructor(
    private viewContainerRef: ViewContainerRef,
    private templateRef: TemplateRef<any>,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.accountService.user$.pipe(take(1)).subscribe({
      next: (user) => {
        if (user) {
          const decodedToken: any = jwtDecode(user.jwt);

          if (
            decodedToken.role.some((role: any) =>
              this.appUserHasRole.includes(role)
            )
          ) {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
          } else {
            this.viewContainerRef.clear();
          }
        } else {
          this.viewContainerRef.clear();
        }
      },
    });
  }
}
