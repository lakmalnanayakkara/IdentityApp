import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AccountRoutingModule } from './account-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../util/material-module';
import { AccountService } from './account.service';
import { HttpClientModule } from '@angular/common/http';
import { ValidationMessagesComponent } from '../util/validation-messages/validation-messages.component';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { SendEmailComponent } from './send-email/send-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { RegisterWithThirdPartyComponent } from './register-with-third-party/register-with-third-party.component';

@NgModule({
  declarations: [
    LoginComponent,
    RegisterComponent,
    ValidationMessagesComponent,
    ConfirmEmailComponent,
    SendEmailComponent,
    ResetPasswordComponent,
    RegisterWithThirdPartyComponent,
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ModalModule.forRoot(),
  ],
  providers: [],
  exports: [LoginComponent, RegisterComponent],
})
export class AccountModule {}
