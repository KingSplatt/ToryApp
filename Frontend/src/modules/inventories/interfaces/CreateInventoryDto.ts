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
  isPublic: boolean;
  ownerId: string;
  tags?: string[];
  customFields?: CreateCustomFieldDto[];
}

