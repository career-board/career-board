import { postImage } from "./post-image.model";


export interface UpdateInterviewRequest {
  interviewId: number;
  userId: number;
  description: string;
  content: string;
  images: postImage[];
  status: string;
  moderatorComment?: string;
  typeId?: number;
}
