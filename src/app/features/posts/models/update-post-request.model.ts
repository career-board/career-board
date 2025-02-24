import { postImage } from "./post-image.model";


export interface UpdateInterviewRequest {
  interviewId: number;
  userId: number;
  description: string;
  details: string;
  images: postImage[];
  status: string;
  editorial?: string;
  typeId: number;
  company: string;
  interviewDate: string;
}
