import {
  Component,
  ElementRef,
  Inject,
  ViewChild,
  Renderer2,
} from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AccountService } from './../account.service';
import { Router, ActivatedRoute } from '@angular/router';
import { take } from 'rxjs';
import { User } from '../../interface/user.interface';
import { SharedService } from '../../util/shared.service';
import { LoginWithExternal } from '../../interface/loginWithExternal';
import { DOCUMENT } from '@angular/common';
import { CredentialResponse } from 'google-one-tap';
import { jwtDecode } from 'jwt-decode';
declare const FB: any;

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  @ViewChild('googleButton', { static: true }) googleButton: ElementRef =
    new ElementRef({});
  loginForm: FormGroup = new FormGroup({});
  submitted = false;
  errorMessages: string[] = [];
  returnUrl: string | null = null;

  constructor(
    private accountService: AccountService,
    private fromBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this.accountService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
        } else {
          this.activatedRoute.queryParamMap.subscribe({
            next: (params: any) => {
              if (params) {
                this.returnUrl = params.get('returnUrl');
              }
            },
          });
        }
      },
    });
  }

  ngOnInit(): void {
    this.initializeGoogleButton();
    this.initializeForm();
  }

  ngAfterViewInit() {
    const script1 = this._renderer2.createElement('script');
    script1.src = 'https://accounts.google.com/gsi/client';
    (script1.async = 'true'),
      (script1.defer = 'true'),
      this._renderer2.appendChild(this._document.body, script1);
  }

  initializeForm() {
    this.loginForm = this.fromBuilder.group({
      username: [
        '',
        [
          Validators.required,
          Validators.pattern(
            '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'
          ),
        ],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
        ],
      ],
    });
  }

  login() {
    this.submitted = true;
    this.errorMessages = [];
    if (this.loginForm.valid) {
      this.accountService.login(this.loginForm.value).subscribe({
        next: () => {
          if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.router.navigateByUrl('/');
          }
        },
        error: (err) => {
          if (err.error?.errors) {
            this.errorMessages = err.error.errors;
          } else {
            this.errorMessages.push(err.error || 'An unknown error occurred');
          }
        },
      });
    }
  }

  resendEmailConfirmationLink() {
    this.router.navigateByUrl(
      '/account/send-email/resend-email-confirmation-link'
    );
  }

  loginWithFacebook() {
    FB.login(async (fbResult) => {
      if (fbResult.authResponse) {
        const accessToken = fbResult.authResponse.accessToken;
        const userId = fbResult.authResponse.userID;

        console.log(fbResult);

        this.accountService
          .loginWithThirdParty(
            new LoginWithExternal(accessToken, userId, 'facebook')
          )
          .subscribe({
            next: (_) => {
              if (this.returnUrl) {
                this.router.navigateByUrl(this.returnUrl);
              } else {
                this.router.navigateByUrl('/');
              }
            },
            error: (err) => {
              this.sharedService.showNotification(false, 'Failed', err.error);
            },
          });
      } else {
        this.sharedService.showNotification(
          false,
          'Failed',
          'Unable to login with your facebook'
        );
      }
    });
  }

  private initializeGoogleButton() {
    (window as any).onGoogleLibraryLoad = () => {
      //@ts-ignore
      google.accounts.id.initialize({
        client_id:
          '615027405104-33amosp2ft69hsnai88e13pom55m3l81.apps.googleusercontent.com',
        callback: this.googleCallback.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      //@ts-ignore
      google.accounts.id.renderButton(this.googleButton.nativeElement, {
        size: 'medium',
        shape: 'rectangular',
        text: 'signup_with',
        logo_alignment: 'center',
      });
    };
  }

  private async googleCallback(response: CredentialResponse) {
    const decodeToken = jwtDecode(response.credential);
    this.accountService
      .loginWithThirdParty(
        new LoginWithExternal(response.credential, decodeToken.sub, 'google')
      )
      .subscribe({
        next: (_) => {
          if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
          } else {
            this.router.navigateByUrl('/');
          }
        },
        error: (err) => {
          this.sharedService.showNotification(false, 'Failed', err.error);
        },
      });
  }
}
