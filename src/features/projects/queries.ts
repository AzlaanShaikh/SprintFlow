import { createSessionClient } from "@/lib/appwrite";
import { getMembers } from "../members/utils";
import { DATABASE_ID, PROJECTS_ID } from "@/config";
import { Project } from "./types";

interface GetProjectProps{
    projectId:string;
}

export const getProject=async({projectId}:GetProjectProps)=>{
    
        const {databases,account}= await createSessionClient();
        const user =await account.get()

        const project =await databases.getDocument<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectId
        );
    
        const member = await getMembers({
            databases,
            workspaceId:project.workspaceId,
            userId:user.$id
        })

        if(!member) {
            throw new Error("Unauthorized")
        };

        

        return project;
}