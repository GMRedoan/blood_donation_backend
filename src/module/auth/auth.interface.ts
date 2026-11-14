import { Role } from "../../../generated/prisma/enums";

export interface ICreateUser {
  name: string;
  email: string;
  phone: string;
  city: string;
  password: string;
  profilePhoto: string;
  role: Role;
}

export interface IVerifyEmail {
  email: string;
  otp: string;
}

export interface ILoginUser {
  email: string;
  password: string;
}

export interface IUpdateUserPayload {
  name?: string;
  phone?: string;
  city?: string;
  area?: string;
}

export interface IGoogleLoginPayload {
  idToken: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  email: string;
  newPassword: string;
  otp: string;
}