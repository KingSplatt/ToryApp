export interface CreateCustomFieldDto {
  name: string;
  type: string;
  showInTable: boolean;
  sortOrder: number;
  validationRules?: string;
  options?: string;
}
export interface CreateInventoryDto {
  title: string;
  description?: string;
  categoryName: string;
  imageUrl?: string;
  isPublic: boolean;
  tags?: string[];
  ownerId: string;
  customFields?: CreateCustomFieldDto[];
  customIdFormat?: string;
  customIdEnabled: boolean;
}

