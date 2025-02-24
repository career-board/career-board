export interface CreateInterviewRequest {
    description: string;
    details: string;
    userId: number;
    imageNames: string[];
    status: "DRAFT" | "PUBLISHED";
    editorial?: string;
    typeId: number;
    company: string;
    interviewDate: string;
}
