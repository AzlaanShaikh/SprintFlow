import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { sessionMiddleware } from "@/lib/session-middleware";
import { DATABASE_ID, IMAGES_BUCKET_ID, MEMBERS_ID, TASKS_ID, WORKSPACES_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { MemberRole } from "@/features/members/types";
import { generateInviteCode } from "@/lib/utils";
import { getMembers } from "@/features/members/utils";
import { z } from "zod";
import { Workspace } from "../types";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/types";

const app =new Hono()
    .get("/",sessionMiddleware,async(c)=>{
        const databases =c.get("databases");
        const user=c.get("user");

        const member= await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            [Query.equal("userId",user.$id)]
        );

        if(member.total===0){
            return c.json({data:{documents:[],total:0}})
        }
        const workspacesIds=member.documents.map((member)=>member.workspaceId);

        const workspaces =await databases.listDocuments(
            DATABASE_ID,
            WORKSPACES_ID,
            [
                Query.orderDesc("$createdAt"),
                Query.contains("$id",workspacesIds)]
        );

        return c.json({data:workspaces})
    })
    .get(
        "/:workspaceId",
        sessionMiddleware,
        async(c)=>{
            const user = c.get("user");
            const databases = c.get("databases");
            const {workspaceId}=c.req.param();
            const member =await getMembers({
                databases,
                workspaceId,
                userId:user.$id,
            });
            if(!member){
                return c.json({error:"Forbidden"},401)
            }
            const workspace =await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            );
            if(!workspace){ 
                return c.json({error:"Workspace not found"},404)
            }
            return c.json({data:workspace})
        })
    .post(
        "/",
        zValidator("form",createWorkspaceSchema),
        sessionMiddleware,
        async(c)=>{
            const databases =c.get("databases");
            const storage =c.get("storage");
            const user=c.get("user");

            const {name,image}=c.req.valid("form")

            let uploadedImageUrl:string | undefined;

            if(image instanceof File){
                const file =await storage.createFile(
                    IMAGES_BUCKET_ID,
                    ID.unique(),
                    image);

                    const arrayBuffer= await storage.getFilePreview(
                        IMAGES_BUCKET_ID,
                        file.$id
                    );

                    uploadedImageUrl=`data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
            }


            const workspace=await databases.createDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                ID.unique(),
                {
                    name,

                    userId:user.$id,
                    imageUrl:uploadedImageUrl,
                    inviteCode:generateInviteCode(6)
                },
            );

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    userId:user.$id,
                    workspaceId:workspace.$id,
                    role:MemberRole.ADMIN,
                },
            );
            return c.json({data:workspace})
        }
    )

    .patch(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("form",updateWorkspaceSchema),
        async (c)=>{
            const databases =c.get("databases");
            const storage =c.get("storage");
            const user=c.get("user");

            const {workspaceId}=c.req.param();
            const {name,image}=c.req.valid("form");

            const member =await getMembers({
                databases,
            workspaceId,
        userId:user.$id,});

        if(!member || member.role !==MemberRole.ADMIN){
            return c.json({error:"Forbidden"},401) 
        }

        let uploadedImageUrl:string | undefined;

        if(image instanceof File){
            const file =await storage.createFile(
                IMAGES_BUCKET_ID,
                ID.unique(),
                image);

                const arrayBuffer= await storage.getFilePreview(
                    IMAGES_BUCKET_ID,
                    file.$id
                );

                uploadedImageUrl=`data:image/png;base64,${Buffer.from(arrayBuffer).toString("base64")}`;
        }else if(typeof image==="string"){
            uploadedImageUrl=image; 
        }

        const workspace=await databases.updateDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId,
            {
                name,
                imageUrl:uploadedImageUrl,
            }
        );

        return c.json({data:workspace})
        }
    )
    .delete("/:workspaceId",sessionMiddleware,async(c)=>{
        const databases =c.get("databases");
        const user=c.get("user");

        const {workspaceId}=c.req.param();
        const member =await getMembers({
            databases,
        workspaceId,
    userId:user.$id,});

    if(!member || member.role !==MemberRole.ADMIN){
        return c.json({error:"Forbidden"},401)}
        
        await databases.deleteDocument(
            DATABASE_ID,
            WORKSPACES_ID,
            workspaceId
        );

        return c.json({data:{$id:workspaceId}})
        })

        .post("/:workspaceId/reset-invite-code",sessionMiddleware,async(c)=>{
            const databases =c.get("databases");
            const user=c.get("user");
    
            const {workspaceId}=c.req.param();
            const member =await getMembers({
                databases,
            workspaceId,
        userId:user.$id,});
    
        if(!member || member.role !==MemberRole.ADMIN){
            return c.json({error:"Forbidden"},401)}
            
           const workspace= await databases.updateDocument(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId,
                {
                    inviteCode:generateInviteCode(6)
                }
            );
    
            return c.json({data:workspace})
            })
    .post(
        "/:workspaceId/join",
        sessionMiddleware,
        zValidator("json", z.object({code:z.string()})),
        async (c)=>{
            const {workspaceId}= c.req.param();
            const {code}= c.req.valid("json");

            const databases = c.get("databases");
            const user =c.get("user");

            const member =await getMembers({
                databases,
                workspaceId,
                userId:user.$id,
            });

            if(member){
                return c.json({error:"Already a member"},400);
            }

            const workspace =await databases.getDocument<Workspace>(
                DATABASE_ID,
                WORKSPACES_ID,
                workspaceId
            );

            if(workspace.inviteCode !== code){
                return c.json({error:"Invalid invite code"},400);
            }

            await databases.createDocument(
                DATABASE_ID,
                MEMBERS_ID,
                ID.unique(),
                {
                    workspaceId,
                    userId:user.$id,
                    role:MemberRole.MEMBER
                }
            );
            return c.json({data:workspace})
        }
    )

    .get(
            "/:workspaceId/analytics",
            sessionMiddleware,
            async (c)=>{
                const databases = c.get("databases");
                const user = c.get("user");
                const { workspaceId } = c.req.param();
    
                const member = await getMembers({
                    databases,
                    workspaceId,
                    userId: user.$id,
                });
                if (!member) {
                    return c.json({ error: "Unauthorized" }, 401);
                }
    
                const now = new Date();
                const thisMonthStart = startOfMonth(now);
                const thisMonthEnd = endOfMonth(now);
                const lastMonthStart = startOfMonth(subMonths(now, 1));
                const lastMonthEnd = endOfMonth(subMonths(now, 1));
    
                const thisMonthTask = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                    ]
                );
                const lastMonthTask = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                    ]
                );
    
                const taskCount = thisMonthTask.total;
                const taskdifference = taskCount - lastMonthTask.total;
    
                const thisMonthAssignedTasks = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                        Query.equal("assigneeId", member.$id),
                        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                    ]
                );
                const lastMonthAssignedTasks = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                        Query.equal("assigneeId", member.$id),
                        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                    ]
                );
    
                const assignedTaskCount = thisMonthAssignedTasks.total;
                const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.total;
    
                const thisMonthIncompleteTasks = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                        Query.notEqual("status", TaskStatus.DONE),
                        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                    ]
                );
                const lastMonthIncompltetTasks = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                        Query.notEqual("status", TaskStatus.DONE),
                        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                    ]
                );
    
                const incompleteTaskCount = thisMonthIncompleteTasks.total;
                const incompleteTaskDifference = incompleteTaskCount - lastMonthIncompltetTasks.total;
    
                const thisMonthCompleteTasks = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                        Query.equal("status", TaskStatus.DONE),
                        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                    ]
                );
                const lastMonthCompltetTasks = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                        Query.equal("status", TaskStatus.DONE),
                        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                    ]
                );
    
                const completeTaskCount = thisMonthCompleteTasks.total;
                const completeTaskDifference = incompleteTaskCount - lastMonthCompltetTasks.total;
    
                const thisMonthOverdueTasks = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                        Query.notEqual("status", TaskStatus.DONE),
                        Query.lessThan("dueDate", now.toISOString()),
                        Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                        Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                    ]
                );
                const lastMonthOverdueTasks = await databases.listDocuments(
                    DATABASE_ID,
                    TASKS_ID,
                    [
                        Query.equal("workspaceId", workspaceId),
                        Query.notEqual("status", TaskStatus.DONE),
                        Query.lessThan("dueDate", now.toISOString()),
                        Query.greaterThanEqual("$createdAt", lastMonthStart.toISOString()),
                        Query.lessThanEqual("$createdAt", lastMonthEnd.toISOString()),
                    ]
                );
    
                const OverdueTaskCount = thisMonthOverdueTasks.total;
                const OverdueTaskDifference = OverdueTaskCount - lastMonthOverdueTasks.total;
    
                return c.json({
                    data: {
                        taskCount,
                        taskdifference,
                        assignedTaskCount,
                        assignedTaskDifference,
                        incompleteTaskCount,
                        incompleteTaskDifference,
                        completeTaskCount,
                        completeTaskDifference,
                        OverdueTaskCount,
                        OverdueTaskDifference
                    }
                })
    
            }
        )
    


export default app;

