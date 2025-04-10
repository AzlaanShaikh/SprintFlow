import { useMutation,  useQueryClient } from "@tanstack/react-query";
import { InferRequestType,InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType=InferResponseType<typeof client.api.tasks[":taskId"]["$delete"],200>
type RequestType=InferRequestType<typeof client.api.tasks[":taskId"]["$delete"]>;

export const useDeleteTask=()=>{
    const queryClient=useQueryClient()
    const mutation=useMutation<ResponseType,Error,RequestType>({
        mutationFn:async({param})=>{
            console.log(param);
            const response=await client.api.tasks[":taskId"]["$delete"]({param});

            if(!response.ok){
                throw new Error("Failed to delete Task")
            }
            
            return await response.json();
        },
        onSuccess:({data})=>{
            toast.success("Task Deleted");
            queryClient.invalidateQueries({queryKey:["tasks"]});
            queryClient.invalidateQueries({queryKey:["task",data.$id]});

        },
        onError:()=>{
            toast.error("Failed to Delete Task");
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
