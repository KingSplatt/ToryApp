import { User } from "../../login/interfaces/UserInterface";
export const USERS_API_URL = "http://localhost:5217/api/Account/users";
export const API_CONFIG = {
    baseUrl: "http://localhost:5217/api",
    ENDPOINTS:{
        users: "/Account/users",
        DELETEusers: "/Account/user/DeleteUsers",
        DELETEUser: "/Account/user"

    }
};

export const getUsers = async (): Promise<User[]> => {
    const response = await fetch(USERS_API_URL);
    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }
    return response.json();
};

export const deleteUser = async (userId: string): Promise<void> => {
    const response = await fetch(`${USERS_API_URL}/${userId}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    
    if (!response.ok) {
        throw new Error(`Failed to delete user with ID: ${userId}`);
    }
};

export const deleteUsers = async (userIds: string[]): Promise<void> => {
    const response = await fetch(API_CONFIG.baseUrl + API_CONFIG.ENDPOINTS.DELETEusers, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userIds),
    });

    if (!response.ok) {
        throw new Error(`Failed to delete users`);
    }
};
