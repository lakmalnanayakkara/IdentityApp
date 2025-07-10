export interface ConfirmEmail {
  token: string;
  email: string;
}

export interface ResetPassword {
  token: string;
  email: string;
  newPassword: string;
}
