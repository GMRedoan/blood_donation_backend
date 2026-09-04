export interface ICreateUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  role?: "ADMIN" | "TENANT";
}