
import {  Query } from "node-appwrite";
import { DATABASE_ID, MEMBERS_ID, WORKSPACES_ID } from "@/config";
import { getMembers } from "../members/utils";
import { Workspace } from "./types";
import { createSessionClient } from "@/lib/appwrite";


export const getWorkspaces=async()=>{
    try {
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
    } catch (error) {
        
        return  ({documents:[],total:0});
    }
}

interface GetWorkspaceProps{
    workspaceId:string;
}

export const getWorkspace=async({workspaceId}:GetWorkspaceProps)=>{
    try {
        const {databases,account}= await createSessionClient();
        const user =await account.get()
    
        const member = await getMembers({
            databases,
            workspaceId,
            userId:user.$id
        })

        if(!member) return null;

        const workspaces =await databases.getDocument<Workspace  >(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );

        return workspaces;
    } catch (error) {
        
        return  null;
    }
}



interface GetWorkspaceInfoProps{
    workspaceId:string;
}

export const getWorkspaceInfo=async({workspaceId}:GetWorkspaceProps)=>{
    try {
        const {databases}= await createSessionClient();

        const workspace =await databases.getDocument<Workspace  >(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );

        return {
            name:workspace.name,
        };
    } catch (error) {
        
        return  null;
    }
}

