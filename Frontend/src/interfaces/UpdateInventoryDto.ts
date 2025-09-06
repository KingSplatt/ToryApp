export interface UpdateInventoryDto {
    title: string;
    description?: string;
    categoryName: string;
    isPublic: boolean;
    tags?: string[];
    imageUrl?: string;
}
