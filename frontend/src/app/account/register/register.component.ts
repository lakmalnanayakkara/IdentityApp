import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  Renderer2,
  Inject,
} from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { User } from '../../interface/user.interface';
import { AccountService } from '../account.service';
import { SharedService } from '../../util/shared.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { CredentialResponse } from 'google-one-tap';
import { DOCUMENT } from '@angular/common';
import { jwtDecode } from 'jwt-decode';
declare const FB: any;

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit {
  @ViewChild('googleButton', { static: true }) googleButton: ElementRef =
    new ElementRef({});
  registerForm: FormGroup = new FormGroup({});
  submitted = false;
  errorMessages: string[] = [];

  constructor(
    private accountService: AccountService,
    private fromBuilder: FormBuilder,
    private sharedService: SharedService,
    private router: Router,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this.accountService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
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
    this.registerForm = this.fromBuilder.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(15),
        ],
      ],
      email: [
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

  register() {
    this.submitted = true;
    this.errorMessages = [];
    if (this.registerForm.valid) {
      this.accountService.register(this.registerForm.value).subscribe({
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

  registerWithFacebook() {
    FB.login(async (fbResult) => {
      if (fbResult.authResponse) {
        const accessToken = fbResult.authResponse.accessToken;
        const userId = fbResult.authResponse.userID;
        this.router.navigateByUrl(
          `/account/register/third-party/facebook?access_token=${accessToken}&userId=${userId}`
        );
      } else {
        this.sharedService.showNotification(
          false,
          'Failed',
          'Unable to register with your facebook'
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
    this.router.navigateByUrl(
      `/account/register/third-party/google?access_token=${response.credential}&userId=${decodeToken.sub}`
    );
  }
}
