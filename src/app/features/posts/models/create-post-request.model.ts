export interface CreateInterviewRequest {
    description: string;
    content: string;
    userId: number;
    imageNames: string[];
    status: "DRAFT" | "PUBLISHED";
    moderatorComment?: string;
    typeId?: number;
}
