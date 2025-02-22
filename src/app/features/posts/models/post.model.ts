import { postImage } from "./post-image.model";

export interface Post {
  interviewId: number;
  description: string;
  content: string;
  createdAt: string;
  userId: number;
  username: string;
  status: 'DRAFT' | 'PUBLISHED';
  images: postImage[];
  moderatorComment: string;
}

