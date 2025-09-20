export interface CreateItemDto {
  inventoryId: number;
  name: string;
  description?: string;
  customId?: string;
  customFieldValues?: CustomFieldValueDto[];
  ImgUrl?: string;
}

export interface CustomFieldValueDto {
  fieldId: number;
  name: string;
  type: string;
  value?: string;
}

export interface ItemDto {
  id: number;
  customId?: string;
  ImgUrl?: string;
  inventoryId: number;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  customFieldValues: CustomFieldValueDto[];
}

export interface UpdateItemDto {
  name?: string;
  description?: string;
  customId?: string;
  customFieldValues?: CustomFieldValueDto[];
  ImgUrl?: string;
}
