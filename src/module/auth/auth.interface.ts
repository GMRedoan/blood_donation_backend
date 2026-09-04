import { BloodGroup, Role } from "../../../generated/prisma/enums";

export interface ICreateUser {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role: Role;
  bloodGroup?: BloodGroup;
}

export interface IVerifyEmail {
  email: string;
  otp: string;
}
