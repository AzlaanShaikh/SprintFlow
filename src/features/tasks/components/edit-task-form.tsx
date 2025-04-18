"use client";
import { useForm } from "react-hook-form";
import { createTaskSchema } from "../schema"; 
import { zodResolver } from "@hookform/resolvers/zod";

import {z} from "zod";

import { Card,CardContent,CardTitle,CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
  SelectValue
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormLabel,
    FormField,
    FormItem,
    FormMessage,
  } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-seperator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { DatePicker } from "@/components/date-picker";
import { MemberAvatar } from "@/features/members/components/members-avatar";
import { Task, TaskStatus } from "../types";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";

import { useUpdateTask } from "../api/use-update-task";

interface EditTaskFormProps {
    onCancel?:()=>void;
    projectOptions:{
      id:string;
      name:string;
      imageUrl:string;
    }[],
    memberOptions:{
      id:string;
      name:string;
    }[];
    initialValues:Task;
}

export const EditTaskForm = ({onCancel,projectOptions,memberOptions,initialValues}:EditTaskFormProps) => {

  const {mutate,isPending}=useUpdateTask()


    const form =useForm<z.infer<typeof createTaskSchema>>({
        resolver:zodResolver(createTaskSchema.omit({workspaceId:true, description:true})),
        defaultValues:{
            ...initialValues,
            dueDate:initialValues.dueDate ? new Date(initialValues.dueDate): undefined,
        }
    })

    const onSubmit=(values:z.infer<typeof createTaskSchema>)=>{
       

        mutate({json:values, param:{taskId:initialValues.$id}},{
          onSuccess:()=>{
            form.reset();
            onCancel?.()
            
          }
    })
        
    }

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex  p-7">
        <CardTitle className="text-xl font-bold">
            Edit a Task
        </CardTitle>
    </CardHeader>
    <div className="px-7">
        <DottedSeparator/>
    </div>
    <CardContent  className="p-7">
        <Form {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col space-y-4">
            <FormField
            control={form.control}
            name="name"
            render={({field})=>(
              <FormItem>
                <FormLabel>
                Task Name
                </FormLabel>
                <FormControl>
                  <Input
                  {...field}
                  placeholder="Enter Task name" />
                </FormControl>
              </FormItem>
            )}
            />

<FormField
            control={form.control}
            name="dueDate"
            render={({field})=>(
              <FormItem>
                <FormLabel>
                Due Date
                </FormLabel>
                <FormControl>
                  <DatePicker {...field}/>
                </FormControl>
              </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="assigneeId"
            render={({field})=>(
              <FormItem>
                <FormLabel>
                Assignee
                </FormLabel>
                <Select
                defaultValue={field.value}
                onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee"/>
                    </SelectTrigger>
                  </FormControl>
                  <FormMessage/>
                  <SelectContent>
                    {memberOptions.map((member)=>(
                      <SelectItem key={member.id} value={member.id}>
                        <div className=" flex items-center space-x-2">
                        <MemberAvatar 
                        className=" size-6"
                        name={member.name}
                        />
                        {member.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>

                </Select>
              </FormItem>
            )}
            />

<FormField
            control={form.control}
            name="status"
            render={({field})=>(
              <FormItem>
                <FormLabel>
                Status
                </FormLabel>
                <Select
                defaultValue={field.value}
                onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status"/>
                    </SelectTrigger>
                  </FormControl>
                  <FormMessage/>
                  <SelectContent>
                    <SelectItem value={TaskStatus.BACKLOG}>
                  Backlog
                    </SelectItem>
                    <SelectItem value={TaskStatus.TODO}>
                  Todo
                    </SelectItem>
                    <SelectItem value={TaskStatus.IN_PROGRESS}>
                  In Progress
                    </SelectItem>
                    <SelectItem value={TaskStatus.IN_REVIEW}>
                  In Review
                    </SelectItem>
                    <SelectItem value={TaskStatus.DONE}>
                  Done
                    </SelectItem>
                   
                  </SelectContent>

                </Select>
              </FormItem>
            )}
            />

<FormField
            control={form.control}
            name="projectId"
            render={({field})=>(
              <FormItem>
                <FormLabel>
                Project
                </FormLabel>
                <Select
                defaultValue={field.value}
                onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee"/>
                    </SelectTrigger>
                  </FormControl>
                  <FormMessage/>
                  <SelectContent>
                    {projectOptions.map((project)=>(
                      <SelectItem key={project.id} value={project.id}>
                        <div className=" flex items-center space-x-2">
                        <ProjectAvatar 
                        className=" size-6"
                        name={project.name}
                        image={project.imageUrl}
                        />
                        {project.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>

                </Select>
              </FormItem>
            )}
            />
            
            </div>
            <DottedSeparator className="p-7"/>
            <div className="flex items-center justify-between">
              <Button
              type="button"
              size={"lg"}
              variant={"secondary"}
              onClick={onCancel}
              disabled={isPending}
              className={cn(onCancel && "invisible")}
              >
                  Cancel
              </Button>
              <Button
              type="submit"
              size={"lg"}
              variant={"primary"}
              disabled={isPending}
              >
                  Save Changes
              </Button>
            </div>
          </form>
        </Form>
    </CardContent>
    </Card>
  )
}
