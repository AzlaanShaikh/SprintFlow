import { Models } from "node-appwrite";

export enum TaskStatus {
    BACKLOG= "BACKLOG",
    IN_PROGRESS= "IN_PROGRESS",
    TODO= "TODO",
    DONE= "DONE",
    IN_REVIEW= "IN_REVIEW"
}

export type Task = Models.Document & {
    name: string;
    status: TaskStatus;
    workspaceId: string;
    assigneeId: string;
    projectId: string;
    position: number;
    dueDate: string;
    description?: string;
    
}