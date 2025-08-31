export interface GrantAccess {
  userId: string,
  accessLevel: number
}

export const AccessLevel = {
  Read: 1,
  Write: 2,
  Creator: 3,
  Admin: 4
} as const;