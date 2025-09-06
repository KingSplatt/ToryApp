import { customFieldData, CustomFieldDto } from "./customFiledInterface";
export interface InventoryDto {
  id: number;
  title: string;
  description: string;
  category: string;
  categoryId: number;
  itemCount: number;
  isPublic: boolean;
  ownerId: number;
  owner: string;
  lastUpdated: Date;
  tags: string[];
  customFields: CustomFieldDto[];
  imageUrl: string;
  createdAt: Date;
  customIdFormat?: string;
  customIdEnabled: boolean;
}