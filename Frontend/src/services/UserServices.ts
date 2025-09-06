import { User } from "../interfaces/UserInterface";
import { CONFIG } from "../config/config";
export const USERS_API_URL = `${CONFIG.API_BASE_URL}/api/Account/users`;
export const API_CONFIG = {
    baseUrl: `${CONFIG.API_BASE_URL}/api/Account`,
    ENDPOINTS:{
        users: "/users",
        DELETEusers: "/user/DeleteUsers",
        DELETEUser: "/user",
        blockUsers: "/users/block",
        unblockUsers: "/users/unblock",
        assignRoles: "/user/roles",
        removeRoles: "/user/roles",
    }
};

export const getUsers = async (): Promise<User[]> => {
    const response = await fetch(USERS_API_URL, {
        credentials: 'include'
    });
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

export const blockUsers = async (userIds: string[]): Promise<void> => {
    const response = await fetch(API_CONFIG.baseUrl + API_CONFIG.ENDPOINTS.blockUsers, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds }),
    });

    if (!response.ok) {
        throw new Error(`Failed to block users`);
    }
};

export const unblockUsers = async (userIds: string[]): Promise<void> => {
    const response = await fetch(API_CONFIG.baseUrl + API_CONFIG.ENDPOINTS.unblockUsers, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userIds),
    });

    if (!response.ok) {
        throw new Error(`Failed to unblock users`);
    }
};

export const assignRoles = async (userIds: string[], roleNames: string[]): Promise<void> => {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.ENDPOINTS.assignRoles}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds, roleNames }),
    });

    if (!response.ok) {
        throw new Error(`Failed to assign roles to users ${userIds.join(", ")}`);
    }
};

export const removeRoles = async (userIds: string[], roleNames: string[]): Promise<void> => {
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.ENDPOINTS.removeRoles}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds, roleNames }),
    });

    if (!response.ok) {
        throw new Error(`Failed to remove roles from users ${userIds.join(", ")}`);
    }
};
