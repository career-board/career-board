import { Post } from "./post.model";

export interface User {
  userId: number;
  username: string;
  firstName: string;
  company: string;
  lastName: string;
  active: boolean;
  status: boolean;
  role: string;
  createdAt: string;
  postCount: number;
}

