import React, { useCallback,useEffect,useState} from "react";
import {
    DragDropContext,
    Droppable,
    Draggable,
    DropResult
} from "@hello-pangea/dnd"


import { Task,TaskStatus } from "../types";

import { KanbanColoumnHeader } from "./kanban-cloumn-header";
import { KanbanCard } from "./kanban-card";


const boards : TaskStatus[] = [
    TaskStatus.BACKLOG,
    TaskStatus.TODO,
    TaskStatus.IN_PROGRESS,
    TaskStatus.IN_REVIEW,
    TaskStatus.DONE
];

type TaskState ={
    [key in TaskStatus]: Task[];

}

interface DataKanbanProps {
    data: Task[];
    onChange: (payload: {
        $id: string;
        status: TaskStatus;
        position: number;
    }[]) => void;
}


export const DataKanban = ({ data,onChange, }: DataKanbanProps) => {
    
    const [tasks, setTasks] = useState<TaskState>(() => {
        const initialTasks: TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: []
        };
        data.forEach((task) => {
            initialTasks[task.status].push(task);
        });

        Object.keys(initialTasks).forEach((key) => {
            initialTasks[key as TaskStatus].sort((a, b) => a.position - b.position);
        });
        
        return initialTasks;
    });

    useEffect(() => {
        const newTasks: TaskState = {
            [TaskStatus.BACKLOG]: [],
            [TaskStatus.TODO]: [],
            [TaskStatus.IN_PROGRESS]: [],
            [TaskStatus.IN_REVIEW]: [],
            [TaskStatus.DONE]: []
        };

        data.forEach((task) => {
            newTasks[task.status].push(task);
        });

        Object.keys(newTasks).forEach((key) => {
            newTasks[key as TaskStatus].sort((a, b) => a.position - b.position);
        });
        setTasks(newTasks);


    }, [data]);

    const onDragEnd = useCallback((result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;
        const sourceStatus = source.droppableId as TaskStatus;
        const destinationStatus = destination.droppableId as TaskStatus;

        let updatesPaylod:{
            $id: string;
            status: TaskStatus;
            position: number;
        }[]=[];

        setTasks((prev) => {
            const newTasks={...prev};
            // Safely remove the task from the source column 
            const sourceColumnTasks = [...newTasks[sourceStatus]];
            const [movedTask] = sourceColumnTasks.splice(source.index, 1);
            // If the task is not found in the source column, return the previous state
            if(!movedTask){
                console.error("No task found to move");
                return prev;
            }
            // Add the task to the destination column
            
            const updatedMovedTask = sourceStatus!==destinationStatus?{
                ...movedTask,
                status: destinationStatus
            }:movedTask;


            newTasks[sourceStatus] = sourceColumnTasks;

            const destColumn= [...newTasks[destinationStatus]];
            destColumn.splice(destination.index,0,updatedMovedTask);

            newTasks[destinationStatus]=destColumn;

            updatesPaylod =[];
            // always update the position of the moved task
            updatesPaylod.push({
                $id:updatedMovedTask.$id,
                status:destinationStatus,
                position:Math.min((destination.index+1)*1000,1_000_000)
            })
            // update the position of the other tasks in the destination column
            newTasks[destinationStatus].forEach((task,index)=>{
                if(task && task.$id !== updatedMovedTask.$id){
                    const newPosition =Math.min((index+1)*1000,1_000_000);
                    if(task.position !== newPosition){
                        updatesPaylod.push({
                            $id:task.$id,
                            status:destinationStatus,
                            position:newPosition
                        })
                    }
                }
            });
            // update the position of the other tasks in the source column
            if(sourceStatus !==destinationStatus){
                newTasks[sourceStatus].forEach((task,index)=>{
                    if(task){
                        const newPositon= Math.min((index+1)*1000,1_000_000);
                        if(task.position !== newPositon){
                            updatesPaylod.push({
                                $id:task.$id,
                                status:sourceStatus,position:newPositon
                            })
                        }
                    }
                })
            }
            return newTasks;
        });
        onChange(updatesPaylod);
    },[onChange]);


    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex overflow-x-auto">
                {boards.map((board) => {
                    return (
                        <div key={board} className="flex-1 mx-2 bg-muted p-1.5 rounded-md  min-w-[200px]">
                            <KanbanColoumnHeader
                            board={board}
                            taskCount={tasks[board].length}
                            />
                            <Droppable droppableId={board}>
                                {(provided)=>(
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className="
                                        flex-col min-h-[200px] py-1.5" >
                                            {tasks[board].map((task, index) => {
                                                return(
                                                    
                                                    <Draggable
                                                    key={task.$id} 
                                                    draggableId={task.$id}
                                                    index={index}>
                                                        
                                                    {(provided)=>(
                                                            <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            >
                                                                <KanbanCard task={task} />
                                                            </div>)}
                                                    </Draggable>

                                                )
                                            })}
                                            {provided.placeholder}
                                    </div>
                                )}

                            </Droppable>
                        </div>
                    )
                })}
            </div>
        </DragDropContext>
    )
};