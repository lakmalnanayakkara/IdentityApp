import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, ReplaySubject, take, tap } from 'rxjs';
import { UserRegister, UserLogin, User } from '../interface/user.interface';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { ConfirmEmail, ResetPassword } from '../interface/account.interface';
import { RegWithExternal } from '../interface/regWithExternal';
import { LoginWithExternal } from '../interface/loginWithExternal';
import { ModalModule } from 'ngx-bootstrap/modal';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private userSource = new ReplaySubject<User | null>(1);
  user$ = this.userSource.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  refreshUser(jwt: string | null) {
    if (jwt === null) {
      this.userSource.next(null);
      return of(undefined);
    }

    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Bearer ' + jwt);

    return this.http
      .get<User>(`${environment.appUrl}account/refresh-token`, {
        headers,
      })
      .pipe(
        tap((user: User) => {
          this.setUser(user);
        })
      );
  }

  logOut() {
    localStorage.removeItem(environment.userKey);
    this.userSource.next(null);
    this.router.navigateByUrl('/');
  }

  register(user: UserRegister) {
    return this.http.post(`${environment.appUrl}account/register`, user);
  }

  registerWithThirdParty(model: RegWithExternal) {
    return this.http
      .post<User>(
        `${environment.appUrl}account/register-with-third-party`,
        model
      )
      .pipe(
        tap((user: User) => {
          this.setUser(user);
        })
      );
  }

  confirmEmail(confirmEmail: ConfirmEmail) {
    return this.http.put(
      `${environment.appUrl}account/confirm-email`,
      confirmEmail
    );
  }

  resendEmailConfirmationLink(email: string) {
    return this.http.post(
      `${environment.appUrl}account/resend-email-confirmation-link/${email}`,
      {}
    );
  }

  resetPassword(resetPassword: ResetPassword) {
    return this.http.put(
      `${environment.appUrl}account/reset-password`,
      resetPassword
    );
  }

  forgotUsernameOrPassword(email: string) {
    return this.http.post(
      `${environment.appUrl}account/forgot-username-or-password/${email}`,
      {}
    );
  }

  login(user: UserLogin): Observable<User> {
    return this.http
      .post<User>(`${environment.appUrl}account/login`, user)
      .pipe(
        tap((loggedUser: User) => {
          if (loggedUser) {
            this.setUser(loggedUser);
          }
          return loggedUser;
        })
      );
  }

  loginWithThirdParty(model: LoginWithExternal) {
    return this.http
      .post<User>(`${environment.appUrl}account/login-with-third-party`, model)
      .pipe(
        tap((loggedUser: User) => {
          if (loggedUser) {
            this.setUser(loggedUser);
          }
          return loggedUser;
        })
      );
  }

  setUser(user: User | null) {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.userSource.next(user);
  }

  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key);
      return user.jwt;
    } else {
      return null;
    }
  }
}
