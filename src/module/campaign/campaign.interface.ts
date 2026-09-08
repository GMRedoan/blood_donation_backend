export interface ICreateCampaignPayload {
  title: string;
  description: string;
  targetAmount: number;
  requestId?: string;
}