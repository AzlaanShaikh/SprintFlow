import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType,InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";



type ResponseType=InferResponseType<typeof client.api.tasks[":taskId"]["$patch"],200>
type RequestType=InferRequestType<typeof client.api.tasks[":taskId"]["$patch"]>;

export const useUpdateTask=()=>{
    
    const queryClient=useQueryClient()
    const mutation=useMutation<ResponseType,Error,RequestType>({
        
        mutationFn:async({json,param})=>{

            const response=await client.api.tasks[":taskId"]["$patch"]({json,param});

            if(!response.ok){
                throw new Error("Failed to update Task")
            }
            
            return await response.json();
        },
        onSuccess:({data})=>{
            toast.success("Task Updated");
            queryClient.invalidateQueries({queryKey:["tasks"]});
            queryClient.invalidateQueries({queryKey:["task",data.$id]});

        },
        onError:()=>{
            toast.error("Failed to update Task");
        }
    })
    return mutation;
}




































// import {useMutation} from "@tanstack/react-query"
// import { InferRequestType,InferResponseType } from "hono"

// import {client} from "@/lib/rpc"


// type ResponseType =InferResponseType<typeof client.api.auth.login["$post"]>;
// type RequestType = InferRequestType<typeof client.api.auth.login["$post"]>;

// export const useLogin =()=>{
//     const mutation=useMutation<ResponseType,Error,RequestType>({
//         mutationFn:async({json})=>{
//             const response=await client.api.auth.login["$post"]({json});
//         return await response.json();
//         }
//     });
//     return mutation;
// }
