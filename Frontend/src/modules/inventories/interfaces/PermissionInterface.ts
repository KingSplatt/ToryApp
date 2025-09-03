export interface UserInventoryPermissionsDto {
  inventoryId: number;
  userId: string;
  isOwner: boolean;
  accessLevel: string;
  canRead: boolean;
  canWrite: boolean;
  canCreateItems: boolean;
  canEditItems: boolean;
  canDeleteItems: boolean;
  canManageInventory: boolean;
}