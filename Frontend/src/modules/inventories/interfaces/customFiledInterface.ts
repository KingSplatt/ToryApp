export interface customFieldData {
  name: string;
  type: string;
  showInTable: boolean;
  sortOrder: number;
  value: string | number | boolean;
  validationRules: {
    required: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  options?: Array<string | number | boolean>;
}