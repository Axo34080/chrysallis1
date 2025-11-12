export class CreateFieldReportDto {
  encryptedContent: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  attachments?: string[];
}
