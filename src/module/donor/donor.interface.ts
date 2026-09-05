import { BloodGroup } from "../../../generated/prisma/enums";

export interface IUpdateDonorProfilePayload {
  bloodGroup?: BloodGroup;
  isAvailable?: boolean;
}
