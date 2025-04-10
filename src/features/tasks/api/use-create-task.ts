import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType,InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType=InferResponseType<typeof client.api.tasks["$post"],200>
type RequestType=InferRequestType<typeof client.api.tasks["$post"]>;

export const useCreateTask=()=>{
    const queryClient=useQueryClient()
    const mutation=useMutation<ResponseType,Error,RequestType>({
        mutationFn:async({json})=>{
            const response=await client.api.tasks["$post"]({json});

            if(!response.ok){
                throw new Error("Failed to create Task")
            }
            
            return await response.json();
        },
        onSuccess:()=>{
            toast.success("Task Created");
            queryClient.invalidateQueries({queryKey:["tasks"]});
        },
        onError:()=>{
            toast.error("Failed to create Task");
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
