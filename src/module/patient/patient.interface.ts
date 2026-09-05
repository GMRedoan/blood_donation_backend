import { BloodGroup, RequesterType } from "../../../generated/prisma/enums";

export interface ICreateRequestPayload {
  requesterType: RequesterType;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospitalName?: string;
  reason: string;
  city: string;
  area: string;
  urgency: string;
}

export interface IUpdateRequestPayload {
  requesterType?: RequesterType;
  patientName?: string;
  bloodGroup?: BloodGroup;
  unitsNeeded?: number;
  hospitalName?: string;
  reason?: string;
  city?: string;
  area?: string;
  urgency?: string;
}


