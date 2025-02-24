import { postImage } from "./post-image.model";

export interface Post {
  postId: number;
  interviewId: number;
  userId: number;
  username: string;
  description: string;
  details: string;
  createdAt: string;
  updatedAt: string;
  status: 'DRAFT' | 'PUBLISHED';
  editorial?: string;
  images: postImage[];
  typeId: number;
  typeName: string;
  company: string;
  interviewDate: string;
}
