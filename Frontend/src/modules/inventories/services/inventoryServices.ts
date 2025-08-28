import { CreateInventoryDto } from "../interfaces/CreateInventoryDto";
import { InventoryDto } from "../interfaces/InventoryDtoInterface";

export const INVENTORY_API_URL = "http://localhost:5217/api/Inventories";
export const API_CONFIG_INVENTORIES = {
  baseUrl: INVENTORY_API_URL,
  ENDPOINTS:{
    GET_INVENTORIES: "/",
    GET_INVENTORY: (id: number) => `/${id}`,
    CREATE_INVENTORY: "/",
    UPDATE_INVENTORY: (id: number) => `/${id}`,
    DELETE_INVENTORY: (id: number) => `/${id}`,
    GET_TAGS: "/tags",
  },
  headers: {
    "Content-Type": "application/json"
  }
};

export const getInventories = async (): Promise<InventoryDto[]> => {
  const response = await fetch(INVENTORY_API_URL);
  if (!response.ok) {
    throw new Error("Failed to fetch inventories");
  }
  return response.json();
};

export const getInventory = async (id: number): Promise<InventoryDto> => {
  const response = await fetch(`${API_CONFIG_INVENTORIES.baseUrl}${API_CONFIG_INVENTORIES.ENDPOINTS.GET_INVENTORY(id)}`);
  if (!response.ok) {
    throw new Error("Failed to fetch inventory");
  }
  return await response.json();
};

export const getTags = async (): Promise<string[]> => {
  const response = await fetch(`${API_CONFIG_INVENTORIES.baseUrl}${API_CONFIG_INVENTORIES.ENDPOINTS.GET_TAGS}`);
  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }
  return await response.json();
};

export const createInventory = async(createDto: CreateInventoryDto): Promise<InventoryDto> => {
  console.log('Sending to API:', createDto);
  console.log('API URL:', `${API_CONFIG_INVENTORIES.baseUrl}${API_CONFIG_INVENTORIES.ENDPOINTS.CREATE_INVENTORY}`);
  
  const response = await fetch(`${API_CONFIG_INVENTORIES.baseUrl}${API_CONFIG_INVENTORIES.ENDPOINTS.CREATE_INVENTORY}`, {
    method: "POST",
    headers: API_CONFIG_INVENTORIES.headers,
    body: JSON.stringify(createDto),
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response body:', errorText);
    throw new Error(`Failed to create inventory: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('Success response:', result);
  return result;
};