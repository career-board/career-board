import { postImage } from "./post-image.model";

export interface Post {
  postId: number;
  interviewId: number;
  userId: number;
  username: string;
  description: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'PUBLISHED';
  moderatorComment?: string;
  images: postImage[];
  typeId: number;
}
