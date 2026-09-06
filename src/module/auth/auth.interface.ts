import { BloodGroup, Role } from "../../../generated/prisma/enums";

export interface ICreateUser {
  name: string;
  email: string;
  phone: string;
  city: string;
  password: string;
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