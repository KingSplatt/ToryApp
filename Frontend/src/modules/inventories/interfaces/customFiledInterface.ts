export interface customFieldData {
  name: string;
  type: string;
  showInTable: boolean;
  sortOrder: number;
  value?: string | number | boolean | Date;
  validationRules: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  options?: Array<string | number | boolean>;
}

export interface CustomFieldDefinition {
  id: number;
  name: string;
  type: 'string' | 'int' | 'bool' | 'date' | 'decimal';
  isActive: boolean;
  sortOrder: number;
  validationRules?: {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
}

export interface CustomFieldDto {
  id: number;
  name: string;
  type: string; 
  showInTable: boolean;
}