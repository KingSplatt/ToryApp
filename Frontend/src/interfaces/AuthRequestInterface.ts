import { User } from './UserInterface';
export interface AuthResponse {
    isAuthenticated: boolean;
    user: User | null;
    timestamp: string;
}