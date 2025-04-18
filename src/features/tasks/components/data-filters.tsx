import { useGetMembers } from "@/features/members/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import {Select,SelectContent,SelectTrigger,SelectItem,SelectValue, SelectSeparator} from "@/components/ui/select";

import { DatePicker } from "@/components/date-picker";
import { FolderIcon, ListChecksIcon, UserIcon } from "lucide-react";
import { TaskStatus } from "../types";
import { useTaskFilters } from "../hooks/use-tasks-filters";

interface DataFiltersProps {
    hideProjectFilter?: boolean;
}
    

export const DataFilters =({hideProjectFilter}:DataFiltersProps)=>{
    const workspaceId=useWorkspaceId();

    const {data:projects,isLoading:isLoadingProjects}=useGetProjects({workspaceId});
    const {data:members,isLoading:isLoadingMembers}=useGetMembers({workspaceId});

    const isLoading=isLoadingProjects || isLoadingMembers;

    const projectOptions=projects?.documents.map((project)=>({
        value:project.$id,
        label:project.name
    }));

    const memberOptions=members?.documents.map((member)=>({
        value:member.$id,
        label:member.name
    }));

    const [{
        status,
        projectId,
        assigneeId,
        dueDate},
        setFilters
    ]=useTaskFilters()

    const onStatusChange=(values:string)=>{
        if(values==="all"){
            setFilters({status:null});
        } else {
            setFilters({status:values as TaskStatus});
        }
    }

    const onAssigneeChange=(values:string)=>{
        if(values==="all"){
            setFilters({assigneeId:null});
        }
        else {
            setFilters({assigneeId:values});
        }
    }
    
    const onProjectChange=(values:string)=>{
        if(values==="all"){
            setFilters({projectId:null});
        }
        else {
            setFilters({projectId:values});
        }
    }

    if(isLoading){
        return null;
    }

    return (
        <div className="flex flex-col lg:flex-row gap-2">
            <Select
            defaultValue={status ?? undefined}
            onValueChange={(value)=>{onStatusChange(value)}}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <ListChecksIcon className=" size-4 mr-2"/>
                        <SelectValue placeholder="All statuses"/>
                        <SelectContent>
                            <SelectItem value="all">All statuses</SelectItem>
                            <SelectSeparator/>
                            <SelectItem
                            value={TaskStatus.BACKLOG}>Baklog</SelectItem>
                            <SelectItem
                            value={TaskStatus.IN_PROGRESS}>In Progress</SelectItem>
                            <SelectItem
                            value={TaskStatus.IN_REVIEW}>In Review</SelectItem>
                            <SelectItem
                            value={TaskStatus.TODO}>Todo</SelectItem>
                            <SelectItem
                            value={TaskStatus.DONE}>Done</SelectItem>
                        </SelectContent>
                    </div>

                </SelectTrigger>


            </Select>

            <Select
            defaultValue={assigneeId ?? undefined}
            onValueChange={(value)=>{onAssigneeChange(value)}}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <UserIcon className=" size-4 mr-2"/>
                        <SelectValue placeholder="All assignees"/>
                        <SelectContent>
                            <SelectItem value="all">All assignees</SelectItem>
                            <SelectSeparator/>
                            {memberOptions?.map((member)=>(
                                <SelectItem key={member.value} value={member.value}>
                                    {member.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </div>

                </SelectTrigger>


            </Select>
            {!hideProjectFilter &&
            <Select
            defaultValue={projectId ?? undefined}
            onValueChange={(value)=>{onProjectChange(value)}}
            >
                <SelectTrigger className="w-full lg:w-auto h-8">
                    <div className="flex items-center pr-2">
                        <FolderIcon className=" size-4 mr-2"/>
                        <SelectValue placeholder="All projects"/>
                        <SelectContent>
                            <SelectItem value="all">All projects</SelectItem>
                            <SelectSeparator/>
                            {projectOptions?.map((project)=>(
                                <SelectItem key={project.value} value={project.value}>
                                    {project.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </div>

                </SelectTrigger>


            </Select>
}

            <DatePicker 
            placeholder="Due date"
            className="w-full lg:w-auto h-8"
            value={dueDate ? new Date(dueDate) : undefined}
            onChange={(date)=>{
                setFilters({dueDate:date ? date.toISOString():null})
            }   }
            
            />
        </div>
    )
}