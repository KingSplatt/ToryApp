export interface DiscussionPost {
  id: number;
  inventoryId: number;
  content: string;
  createdAt: string;
  likesCount: number;
  author: {
    id: string;
    userName: string;
    email: string;
  };
  isLikedByCurrentUser: boolean;
}
export interface CreateDiscussionPostDto {
  inventoryId: number;
  content: string;
}

export interface UpdateDiscussionPostDto {
  content: string;
}

export interface LikeResponse {
  likesCount: number;
  isLiked: boolean;
}