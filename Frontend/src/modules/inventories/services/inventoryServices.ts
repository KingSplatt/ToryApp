import { CreateInventoryDto } from "../interfaces/CreateInventoryDto";
import { InventoryDto } from "../interfaces/InventoryDtoInterface";
import { GrantAccess } from "../interfaces/GrantAccessInterface";
import { Tag } from "../interfaces/TagInterface";

export const INVENTORY_API_URL = "http://localhost:5217/api/Inventories";
export const API_CONFIG_INVENTORIES = {
  baseUrl: INVENTORY_API_URL,
  ENDPOINTS:{
    GET_INVENTORIES: "/",
    GET_INVENTORY: (id: number) => `/${id}`,
    GET_INVENTORIES_WITH_WRITE_ACCESS: (userId: string) => `/user/writeAccess/${userId}`,
    CREATE_INVENTORY: "/",
    UPDATE_INVENTORY: (id: number) => `/${id}`,
    DELETE_INVENTORY: (id: number) => `/${id}`,
    GET_TAGS: "/tags",
    GRANT_WRITER_ACCESS: (id: number) => `/${id}/grant-access`,
    REVOKE_WRITER_ACCESS: (id: number, userId: string) => `/${id}/revoke-access/${userId}`
  },
  headers: {
    "Content-Type": "application/json"
  }
};

export const getPopularTags = async (): Promise<Tag[]> => {
  const response = await fetch(`${API_CONFIG_INVENTORIES.baseUrl}${API_CONFIG_INVENTORIES.ENDPOINTS.GET_TAGS}`);
  if (!response.ok) {
    throw new Error("Failed to fetch tags");
  }
  return await response.json();
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

export const getUserInventories = async (userId: string): Promise<InventoryDto[]> => {
  const response = await fetch(`${API_CONFIG_INVENTORIES.baseUrl}/user/${userId}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user inventories");
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

export const getUserInventoriesWithWriteAccess = async (userId: string): Promise<InventoryDto[]> => {
  const response = await fetch(`${API_CONFIG_INVENTORIES.baseUrl}${API_CONFIG_INVENTORIES.ENDPOINTS.GET_INVENTORIES_WITH_WRITE_ACCESS(userId)}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error("Failed to fetch user inventories");
  }
  return await response.json();
};

export const createInventory = async(createDto: CreateInventoryDto): Promise<InventoryDto> => {
  console.log('Sending to API:', createDto);
  console.log('API URL:', `${API_CONFIG_INVENTORIES.baseUrl}${API_CONFIG_INVENTORIES.ENDPOINTS.CREATE_INVENTORY}`);
  
  const response = await fetch(`${API_CONFIG_INVENTORIES.baseUrl}${API_CONFIG_INVENTORIES.ENDPOINTS.CREATE_INVENTORY}`, {
    method: "POST",
    credentials: 'include',
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

export const grantWriterAccess = async (inventoryId: number, grantAccess: GrantAccess) => {
  console.log('Granting access with data:', grantAccess);
  const response = await fetch(`${API_CONFIG_INVENTORIES.baseUrl}${API_CONFIG_INVENTORIES.ENDPOINTS.GRANT_WRITER_ACCESS(inventoryId)}`, {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(grantAccess)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Error response body:', errorText);
    throw new Error('Failed to grant access' + errorText);
  }
};

export const revokeWriterAccess = async (inventoryId: number, userId: string) => {
  const response = await fetch(`${API_CONFIG_INVENTORIES.baseUrl}${API_CONFIG_INVENTORIES.ENDPOINTS.REVOKE_WRITER_ACCESS(inventoryId, userId)}`, {
    method: "DELETE",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error('Failed to revoke access');
  }
};
