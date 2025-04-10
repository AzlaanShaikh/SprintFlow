import { sessionMiddleware } from "@/lib/session-middleware";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createTaskSchema } from "../schema";
import { getMembers } from "@/features/members/utils";
import { DATABASE_ID, MEMBERS_ID, PROJECTS_ID, TASKS_ID } from "@/config";
import { ID, Query } from "node-appwrite";
import { z } from "zod";
import { Task, TaskStatus } from "../types";
import { createAdminClient } from "@/lib/appwrite";
import { Project } from "@/features/projects/types";


const app= new Hono()
.delete("/:taskId",
    sessionMiddleware,
    async(c)=>{
        const user =c.get("user");
        const databases = c.get("databases");
        const {taskId} = c.req.param();
        const task = await databases.getDocument<Task>(
            DATABASE_ID,
            TASKS_ID,
            taskId
        );

        const member =await getMembers({
            databases,
            workspaceId:task.workspaceId,
            userId:user.$id
        })

        if(!member){
            return c.json({error:"You are not a member of the workspace"},401);
        }

        await databases.deleteDocument(
            DATABASE_ID,
            TASKS_ID,
            taskId
        );
        return c.json({data:{$id:taskId}});
    })
    
.get(
    "/",
    sessionMiddleware,
    zValidator("query",z.object({
        workspaceId:z.string(),
        projectId:z.string().nullish(),
        assigneeId:z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search:z.string().nullish(),
        dueDate:z.string().nullish()
    })),
    async(c)=>{
        const {users} =await createAdminClient();
        const user = c.get("user");
        const databases = c.get("databases");

        const {workspaceId, projectId, assigneeId, status, search, dueDate}=c.req.valid("query");

        const member = await getMembers({
            databases,
            workspaceId,
            userId:user.$id
        })

        if(!member){
            return c.json({message:"You are not a member of the workspace"});
        }

        const query = [
            Query.equal("workspaceId",workspaceId),
            Query.orderDesc("$createdAt")
        ];

        if(projectId){
            query.push(Query.equal("projectId",projectId));
        }

        if(status){
            query.push(Query.equal("status",status));
        }
        if(assigneeId){
            query.push(Query.equal("assigneeId",assigneeId));
        }
        if(search){
            query.push(Query.search("name",search));
        }
        if(dueDate){
            query.push(Query.equal("dueDate",dueDate));
        }

        const tasks = await databases.listDocuments<Task>(
            DATABASE_ID,
            TASKS_ID,
            query
        );

        const projectIds = tasks.documents.map((task)=>task.projectId);
        const assigneeIds = tasks.documents.map((task)=>task.assigneeId);

        const projects = await databases.listDocuments<Project>(
            DATABASE_ID,
            PROJECTS_ID,
            projectIds.length>0?[Query.contains("$id",projectIds)]:[]
        );

        const members = await databases.listDocuments(
            DATABASE_ID,
            MEMBERS_ID,
            assigneeIds.length>0?[Query.contains("$id",assigneeIds)]:[]
        );

        const assignees = await Promise.all(
            members.documents.map(async (member) => {
                const user = await users.get(member.userId);
                return {
                    ...member,
                    name:user.name || user.email,
                    email:user.email
                }
            }));

        const popoulatedTasks = tasks.documents.map((task)=>{
            const project = projects.documents.find((project)=>project.$id===task.projectId);
            const assignee = assignees.find((member)=>member.$id===task.assigneeId);
            return {
                ...task,
                project,
                assignee
            }
        });

        return c.json({
            data:{
            ...tasks,
            documents:popoulatedTasks
        }});

    })
    .post("/",
        sessionMiddleware,
        zValidator("json",createTaskSchema),
        async(c)=>{
            const user = c.get("user");
            const databases =c.get("databases");
            const {name, status, workspaceId, projectId, dueDate, assigneeId, description}=c.req.valid("json");
            console.log("Works till getMembers");
            
            const member=await getMembers({
                databases,
                workspaceId,
                userId:user.$id
            })
            console.log("Works after getMembers");
            if(!member){
                return c.json({message:"You are not a member of the workspace"});
            }
            console.log("Works3");
            const higherPostionTask = await databases.listDocuments(
                DATABASE_ID,
                TASKS_ID,
                [
                Query.equal("status",status),
                Query.equal("workspaceId",workspaceId),
                Query.orderAsc("position"),
                Query.limit(1)
                ]
            )
            console.log("Works4");
            const newPostion = higherPostionTask.documents.length>0
            ?higherPostionTask.documents[0].position+1000 :1000;
            console.log(TASKS_ID);
            
            const task = await databases.createDocument(
                DATABASE_ID,
                TASKS_ID,
                ID.unique(),
                {
                    name,
                    status,
                    workspaceId,
                    projectId,
                    dueDate,
                    assigneeId,
                    description,
                    position:newPostion
                }
            );

            return c.json({data:task});

        }
    )
    .patch("/:taskId",
        sessionMiddleware,
        zValidator("json",createTaskSchema.partial()),
        async(c)=>{
            const user = c.get("user");
            const databases =c.get("databases");
            const {name, status, projectId, dueDate, assigneeId, description}=c.req.valid("json");
            const {taskId} = c.req.param();
            const existingTask = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );
            
            const member=await getMembers({
                databases,
                workspaceId:existingTask.workspaceId,
                userId:user.$id
            })
            
            if(!member){
                return c.json({error:"You are not a member of the workspace"},401);
            }
           
            
            const task = await databases.updateDocument(
                DATABASE_ID,
                TASKS_ID,
                taskId,
                {
                    name,
                    status,
                    projectId,
                    dueDate,
                    assigneeId,
                    description
                }
            );

            return c.json({data:task});

        }
    )
    .get("/:taskId",
        sessionMiddleware,
        async(c)=>{
            const currentUser = c.get("user");
            const databases =c.get("databases");
            const {users}= await createAdminClient();
            const {taskId} = c.req.param();
            const task = await databases.getDocument<Task>(
                DATABASE_ID,
                TASKS_ID,
                taskId
            );
            const currentMember =await getMembers({
                databases,
                workspaceId:task.workspaceId,
                userId:currentUser.$id
            })
            if(!currentMember){
                return c.json({error:"You are not a member of the workspace"},401);
            }

            const project = await databases.getDocument<Project>(
                DATABASE_ID,
                PROJECTS_ID,
                task.projectId
            )

            const member = await databases.getDocument(
                DATABASE_ID,
                MEMBERS_ID,
                task.assigneeId
            );

            const user = await users.get(member.userId);

            const assignee={
                ...member,
                name:user.name || user.email,
                email:user.email
            };

            return c.json({
                data:{
                    ...task,
                    project,
                    assignee
                }
            });
           
        }
    )
    .post(
        "/bulk-update",
        sessionMiddleware,
        zValidator("json",z.object({
            tasks:z.array(z.object({
                $id:z.string(),
                status:z.nativeEnum(TaskStatus),
                position:z.number()
            }))
        })),
        async(c)=>{
        const databases = c.get("databases");
        const user = c.get("user");
        const {tasks} =await c.req.valid("json");

        const tasksToUpdate =await databases.listDocuments<Task>(
            DATABASE_ID,
            TASKS_ID,
            [
                Query.contains("$id",tasks.map((task)=>task.$id))
            ]
        );
        const workspacesIds = new Set(tasksToUpdate.documents.map((task)=>task.workspaceId));  
        if(workspacesIds.size>1){
            return c.json({error:"You can only update tasks from the same workspace"},400);
        }

        const workspaceId = workspacesIds.values().next().value;

        if (!workspaceId) {
            return c.json({ error: "Workspace ID is required" }, 400);
        }

        const member = await getMembers({
            databases,
            workspaceId,
            userId: user.$id
        });

        if (!member) {
            return c.json({ error: "You are not a member of the workspace" }, 401);
        }

        const updatedTasks = await Promise.all(
            tasks.map(async (task) => {
                const {$id, status, position} = task;
                return databases.updateDocument<Task>(
                    DATABASE_ID,
                    TASKS_ID,
                    $id,
                    {
                        status,
                        position
                    }
                );  
            }
        )
    )

        return c.json({data:updatedTasks});

        
        }
    )



export default app;