import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType,InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType=InferResponseType<typeof client.api.workspaces["$post"]>
type RequestType=InferRequestType<typeof client.api.workspaces["$post"]>;

export const useCreateWorkspace=()=>{
    const queryClient=useQueryClient()
    const mutation=useMutation<ResponseType,Error,RequestType>({
        mutationFn:async({form})=>{
            const response=await client.api.workspaces["$post"]({form});
            
            return await response.json();
        },
        onSuccess:()=>{
            toast.success("Workspace created successfully");
            queryClient.invalidateQueries({queryKey:["workspaces"]});
        },
        onError:(error)=>{
            toast.error("Failed to create workspace");
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
