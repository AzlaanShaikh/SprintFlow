
import {  Query } from "node-appwrite";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { getMembers } from "../members/utils";
import { Workspace } from "./types";
import { createSessionClient } from "@/lib/appwrite";


export const getWorkspaces=async()=>{
   
        const {databases,account}= await createSessionClient();
        const user =await account.get()
    
        const member= await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId",user.$id)]
        );

        if(member.total===0){
            return ({documents:[],total:0})
        }
        const workspacesIds=member.documents.map((member)=>member.workspaceId);

        const workspaces =await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id",workspacesIds)]
        );

        return workspaces;
  
}

interface GetWorkspaceProps{
    workspaceId:string;
}

export const getWorkspace=async({workspaceId}:GetWorkspaceProps)=>{
    
        const {databases,account}= await createSessionClient();
        const user =await account.get()
    
        const member = await getMembers({
            databases,
            workspaceId,
            userId:user.$id
        })

        if(!member) {
            throw new Error("Unauthorized")
        };

        const workspaces =await databases.getDocument<Workspace  >(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );

        return workspaces;
    } 




interface GetWorkspaceInfoProps{
    workspaceId:string;
}

export const getWorkspaceInfo=async({workspaceId}:GetWorkspaceInfoProps)=>{
    
        const {databases}= await createSessionClient();

        const workspace =await databases.getDocument<Workspace  >(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );

        return {
            name:workspace.name,
        };
    } 


