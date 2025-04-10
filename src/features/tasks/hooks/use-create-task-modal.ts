import {useQueryState, parseAsBoolean, parseAsString} from "nuqs"
import { TaskStatus } from "../types"

export const useCreateTasktModal =()=>{
    const [isOpen, setIsOpen] = useQueryState(
        "create-task",
        parseAsBoolean.withDefault(false).withOptions({clearOnDefault: true})
    )
    const [status, setStatus] = useQueryState(
        "task-status",
        parseAsString.withOptions({ clearOnDefault: true }) 
    )
    return {
        isOpen,
        status: status as TaskStatus,
        setStatus,
        open:(initialStatus?:TaskStatus)=>{
            if (initialStatus) setStatus(initialStatus);
            setIsOpen(true)},
        close:()=>{
            console.log("Before close:", status);
            setStatus(null);
            setIsOpen(false);
            console.log("After close:", status);
        },
        setIsOpen
    }
}