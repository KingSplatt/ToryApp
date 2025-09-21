import { DiscussionPost } from "../interfaces/DiscussionPostInterface";
import CONFIG from "../config/config";
export const DISCUSSION_API_URL = `${CONFIG.API_BASE_URL}/api/Discussion`;
export const API_CONFIG_DISCUSSION = {
  baseUrl: DISCUSSION_API_URL,
  ENDPOINTS: {
    GET_DISCUSSION_POSTS: (inventoryId: number) => `${DISCUSSION_API_URL}/inventory/${inventoryId}`,
    GET_DISCUSSION_POST: (id: number) => `${DISCUSSION_API_URL}/${id}`,
    CREATE_DISCUSSION_POST: `${DISCUSSION_API_URL}`,
    UPDATE_DISCUSSION_POST: (id: number) => `${DISCUSSION_API_URL}/${id}`,
    DELETE_DISCUSSION_POST: (id: number) => `${DISCUSSION_API_URL}/${id}`,
    TOGGLE_LIKE: (postId: number) => `${DISCUSSION_API_URL}/${postId}/like`,
  }
};

export const getDiscussionPosts = async (inventoryId: number): Promise<DiscussionPost[]> => {
  const url = API_CONFIG_DISCUSSION.ENDPOINTS.GET_DISCUSSION_POSTS(inventoryId);
  
  const response = await fetch(url, {
    credentials: 'include'
  });
  
  
  if (!response.ok) {
    throw new Error(`Failed to fetch discussion posts: ${response.status} ${response.statusText}`);
  }
  return await response.json();
}

export const createDiscussionPost = async (post: { inventoryId: number; content: string; }): Promise<DiscussionPost> => {
  const url = API_CONFIG_DISCUSSION.ENDPOINTS.CREATE_DISCUSSION_POST;
  
  const response = await fetch(url, {
    method: "POST",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(post)
  });
  
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create post error:', errorText);
    throw new Error(`Failed to create discussion post: ${response.status} ${response.statusText}`);
  }
  
  try {
    const result = await response.json();
    return result;
  } catch (jsonError) {
    console.error('JSON parsing error:', jsonError);
    throw new Error('Failed to parse response JSON');
  }
}
export const updateDiscussionPost = async (id: number, post: { content: string; }): Promise<DiscussionPost> => {
  const response = await fetch(`${API_CONFIG_DISCUSSION.ENDPOINTS.UPDATE_DISCUSSION_POST(id)}`, {
    method: "PUT",
    credentials: 'include',
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(post)
  });
  if (!response.ok) {
    throw new Error("Failed to update discussion post");
  }
  return await response.json();
}

export const deleteDiscussionPost = async (id: number): Promise<void> => {
  const response = await fetch(`${API_CONFIG_DISCUSSION.ENDPOINTS.DELETE_DISCUSSION_POST(id)}`, {
    method: "DELETE",
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error("Failed to delete discussion post");
  }
}

export const toggleLikeDiscussionPost = async (postId: number): Promise<{ likesCount: number; isLiked: boolean }> => {
  const response = await fetch(`${API_CONFIG_DISCUSSION.ENDPOINTS.TOGGLE_LIKE(postId)}`, {
    method: "POST",
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error("Failed to toggle like discussion post");
  }
  return await response.json();
}

