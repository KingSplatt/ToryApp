export interface User{
    id: string;
  email: string;
  fullName: string;
  profilePictureUrl?: string;
  isOAuthUser?: boolean;
  roles?: string[];
  isBlocked: boolean;
  blockedAt: string;
}