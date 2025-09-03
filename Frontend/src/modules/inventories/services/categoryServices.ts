import { Category,CreateCategoryDto } from "../interfaces/CategoryInterface";
export const CATEGORY_API_URL = "http://localhost:5217/api/Categories";
export const API_CONFIG_INVENTORIES_CAT = {
  baseUrl: CATEGORY_API_URL,
  ENDPOINTS: {
    GET_CATEGORIES: "/",
    CREATE_CATEGORY: "/",
  },
  headers: {
    "Content-Type": "application/json"
  }
};

export const getCategories = async (): Promise<Category[]> => {
  const response = await fetch(`${API_CONFIG_INVENTORIES_CAT.baseUrl}${API_CONFIG_INVENTORIES_CAT.ENDPOINTS.GET_CATEGORIES}`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return await response.json();
};

export const createCategory = async (category: CreateCategoryDto): Promise<Category> => {
  const response = await fetch(`${API_CONFIG_INVENTORIES_CAT.baseUrl}${API_CONFIG_INVENTORIES_CAT.ENDPOINTS.CREATE_CATEGORY}`, {
    method: "POST",
    headers: API_CONFIG_INVENTORIES_CAT.headers,
    body: JSON.stringify(category)
  });
  if (!response.ok) {
    throw new Error("Failed to create category");
  }
  return await response.json();
};
