import { BloodGroup, RequesterType, RequestStatus } from "../../../generated/prisma/browser";

export interface IRequestFilters {
  bloodGroup?: BloodGroup;
  city?: string;
  area?: string;
  requesterType?: RequesterType;
  urgency?: string;
  status?: RequestStatus;
  sortBy?: "createdAt" | "updatedAt" | "urgency" | "unitsNeeded";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

