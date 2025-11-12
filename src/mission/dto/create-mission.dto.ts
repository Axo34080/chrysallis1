export class CreateMissionDto {
  id: string;
  codeName?: string;
  description?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  classificationLevel?: string;
  encryptedData?: string;
}
