import { Task } from "../types";
import { DottedSeparator } from "@/components/dotted-seperator";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useState } from "react";
import { useUpdateTask } from "../api/use-update-task";
import { PencilIcon, XIcon } from "lucide-react";


interface TaskDescriptionProps {
    task:Task
}

export const TaskDescription = ({task}:TaskDescriptionProps) => {
    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(task.description);

    const {mutate,isPending}= useUpdateTask();

    const handleSave =()=>{
       mutate({
            json:{description:value},
            param:{taskId: task.$id}
        },{
            onSuccess:()=>{
                setIsEditing(false);
            },
            onError:()=>{
                setValue(task.description);
            }
        })
    };
    return (
        <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between">
                <p className="text-lg font-semibold">Overview</p>
                <Button onClick={()=> setIsEditing((prev)=> !prev)} size={"sm"} variant={"secondary"}>
                    {isEditing?(
                        <XIcon className="size-4 mr-2"/>
                    ):(
                <PencilIcon className="size-4 mr-2"/>
            )}
                {isEditing? "Cancel": "Edit"}
                </Button>
            </div>
            <DottedSeparator className="my-4"/>
            {isEditing?(
                <div className="flex flex-col gap-y-4">
                <Textarea
                value={value}
                onChange={(e)=>setValue(e.target.value)}
                placeholder="Add a description..."
                rows={5}
                className="resize-none font-medium"
                disabled={isPending}
                />
                <Button
                onClick={handleSave}
                disabled={isPending}
                size="sm"
                className="ml-auto w-fit"
                >
                    {isPending? "Saving...": "Save"}
                </Button>
                </div>
            ):(
                <div className="text-sm text-muted-foreground">
                    {task.description || (
                        <span className="text-muted-foreground">
                            No dexcription set
                        </span>
                    )}
                </div>
            )}
        </div>
    )
}