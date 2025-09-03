import { Items } from "../interfaces/itemInterface";
import { CreateItemDto } from "../interfaces/CreateItemDto";
export const ITEMS_API_URL = "http://localhost:5217/api/Items";
export const API_CONFIG = {
    baseUrl: ITEMS_API_URL,
    ENDPOINTS:{
        GET_ITEM_FOR_INVENTORY: (id:number) => `/inventory/${id}`,
        GET_ITEMS: (id: number) => `/${id}`,
        CREATE_ITEM: () => `/`,
        UPDATE_ITEM: (id: number) => `/${id}`,
        DELETE_ITEM: (id: number) => `/${id}`
    },
    headers: {
        "Content-Type": "application/json"
    }
}

export const getItemsForInventory = async (id: number) => {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.ENDPOINTS.GET_ITEM_FOR_INVENTORY(id)}`, {
        method: "GET",
        headers: API_CONFIG.headers,
        credentials: "include"
    });
    return response.json();
};

export const getItems = async (id: number) => {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.ENDPOINTS.GET_ITEMS(id)}`, {
        method: "GET",
        headers: API_CONFIG.headers,
        credentials: "include"
    });
    return response.json();
};

export const createItem = async (itemData: CreateItemDto) => {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.ENDPOINTS.CREATE_ITEM()}`, {
        method: "POST",
        headers: API_CONFIG.headers,
        credentials: "include",
        body: JSON.stringify(itemData)
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create item: ${response.status} - ${errorText}`);
    }
    
    return response.json();
};

export const updateItem = async (id: number, itemData: Items) => {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.ENDPOINTS.UPDATE_ITEM(id)}`, {
        method: "PUT",
        headers: API_CONFIG.headers,
        body: JSON.stringify(itemData)
    });
    return response.json();
};

export const deleteItem = async (id: number) => {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.ENDPOINTS.DELETE_ITEM(id)}`, {
        method: "DELETE",
        headers: API_CONFIG.headers
    });
    return response.json();
};
