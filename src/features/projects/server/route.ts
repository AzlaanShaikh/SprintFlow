import { DATABASE_ID, IMAGES_BUCKET_ID, PROJECTS_ID, TASKS_ID} from "@/config";
import { getMembers } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";

import { Hono } from "hono";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { createProjectSchema, updateProjectSchema } from "../schemas";

import { Project } from "../types";
import { endOfMonth,startOfMonth,subMonths } from "date-fns";
import { TaskStatus } from "@/features/tasks/types";

const app = new Hono()
.post( 
    "/",
    sessionMiddleware,
    zValidator("form",  
    createProjectSchema),
    async(c)=>{
        const databases =c.get("databases");
        const storage =c.get("storage");
        const user=c.get("user");

        const {name,image,workspaceId}=c.req.valid("form")

        const member =await getMembers({
            databases,
            workspaceId,
            userId:user.$id
        })

        if(!member){
            return c.json({error:"Unauthorized"},401)
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
        }


        const project=await databases.createDocument(
            DATABASE_ID,
            PROJECTS_ID,
            ID.unique(),
            {
                name,
                imageUrl:uploadedImageUrl,
                workspaceId
            },
        );

        
        return c.json({data:project})
    }

)

    .get("/",sessionMiddleware,
        zValidator("query",z.object({workspaceId:z.string()})),
        async(c)=>{
            const user =c.get("user")
            const databases=c.get("databases")

            const {workspaceId}=c.req.valid("query")

            if(!workspaceId){
                return c.json({error:"Missing WorkspaceId"},402)
            }

            const member = await getMembers({databases,
                workspaceId,
                userId:user.$id
            })
            if(!member ){
                return c.json({error:"Unathorized"},401)
            }

            const projects = await databases.listDocuments<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                [
                    Query.equal("workspaceId",workspaceId),
                    Query.orderDesc("$createdAt"),
                ],
            );

            return c.json({data:projects})
        }
    )

    .get(
        "/:projectId",
        sessionMiddleware,
        async (c)=>{
            const user = c.get("user");
            const databases = c.get("databases");
            const { projectId } = c.req.param();

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
            );

            const member = await getMembers({
                databases,
                workspaceId: project.workspaceId,
                userId: user.$id,
            });

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            return c.json({ data: project });

        }
        )

    .patch(
            "/:projectId",
            sessionMiddleware,
            zValidator("form",updateProjectSchema),
            async (c)=>{
                const databases =c.get("databases");
                const storage =c.get("storage");
                const user=c.get("user");
    
                const {projectId}=c.req.param();
                const {name,image}=c.req.valid("form");

                const existingProject =await databases.getDocument<Project>(
                    DATABASE_ID,
                    PROJECTS_ID,
                    projectId
                )
    
                const member =await getMembers({
                    databases,
                    workspaceId:existingProject.workspaceId,
            userId:user.$id,});
    
            if(!member){
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
    
            const project=await databases.updateDocument(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
                {
                    name,
                    imageUrl:uploadedImageUrl,
                }
            );
    
            return c.json({data:project})
            }
        )

     .delete("/:projectId",sessionMiddleware,async(c)=>{
            const databases =c.get("databases");
            const user=c.get("user");
    
            const {projectId}=c.req.param();

            const existingProject =await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            )
            const member =await getMembers({
                databases,
            workspaceId:existingProject.workspaceId,
        userId:user.$id,});
    
        if(!member){
            return c.json({error:"Forbidden"},401)}
            
            await databases.deleteDocument(
                DATABASE_ID,
                PROJECTS_ID,
                projectId
            );
    
            return c.json({data:{$id:projectId}})
            })

    .get(
        "/:projectId/analytics",
        sessionMiddleware,
        async (c)=>{
            const databases = c.get("databases");
            const user = c.get("user");
            const { projectId } = c.req.param();

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                projectId,
            );
            const member = await getMembers({
                databases,
                workspaceId: project.workspaceId,
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
                    Query.equal("projectId", projectId),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );
            const lastMonthTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
                    Query.equal("assigneeId", member.$id),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );
            const lastMonthAssignedTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
                    Query.notEqual("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );
            const lastMonthIncompltetTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
                    Query.equal("status", TaskStatus.DONE),
                    Query.greaterThanEqual("$createdAt", thisMonthStart.toISOString()),
                    Query.lessThanEqual("$createdAt", thisMonthEnd.toISOString()),
                ]
            );
            const lastMonthCompltetTasks = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
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
                    Query.equal("projectId", projectId),
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