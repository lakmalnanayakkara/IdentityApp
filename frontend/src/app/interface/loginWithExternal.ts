export class LoginWithExternal {
  userId: string;
  accessToken: string;
  provider: string;

  constructor(accessToken: string, userId: string, provider: string) {
    this.userId = userId;
    this.accessToken = accessToken;
    this.provider = provider;
  }
}
