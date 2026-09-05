import { BloodGroup, RequesterType } from "../../../generated/prisma/browser";

export interface ICreateRequestPayload {
  creator: string;
  requesterType: RequesterType;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  city: string;
  area: string;
  urgency: string;
}
