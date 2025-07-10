export interface UserLogin {
  username: string;
  password: string;
}

export interface UserRegister {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface User {
  firstName: string;
  lastName: string;
  jwt: string;
}
