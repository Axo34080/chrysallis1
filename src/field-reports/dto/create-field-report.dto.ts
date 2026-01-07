export class CreateFieldReportDto {
  details: string;
  authorAgent?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  status?: string;
  attachments?: string[];
}
