export class CreateStepDto {
  title: string;
  description?: string;
  status?: string;
  order?: number;
  encryptedInstructions?: string;
}
