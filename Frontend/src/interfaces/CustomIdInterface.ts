export interface CustomIdFormatDto {
  format: string;
  enabled: boolean;
  preview: string;
}

export interface UpdateCustomIdFormatDto {
  format: string;
  enabled: boolean;
}

export interface CustomIdElement {
  id: string;
  name: string;
  description: string;
  placeholder: string;
}

export const CUSTOM_ID_ELEMENTS: CustomIdElement[] = [
  {
    id: 'random20',
    name: 'Random 20-bit number',
    description: 'Generates a random number using 20 bits (0-1048575)',
    placeholder: '{random20}'
  },
  {
    id: 'random32',
    name: 'Random 32-bit number', 
    description: 'Generates a random number using 32 bits (0-4294967295)',
    placeholder: '{random32}'
  },
  {
    id: 'random6',
    name: 'Random 6-digit number',
    description: 'Generates a random 6-digit number (100000-999999)',
    placeholder: '{random6}'
  },
  {
    id: 'random9',
    name: 'Random 9-digit number',
    description: 'Generates a random 9-digit number (100000000-999999999)',
    placeholder: '{random9}'
  }
];
