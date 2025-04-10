import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType,InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType=InferResponseType<typeof client.api.workspaces[":workspaceId"]["join"]["$post"],200>
type RequestType=InferRequestType<typeof client.api.workspaces[":workspaceId"]["join"]["$post"]>;

export const useJoinWorkspace=()=>{
    const queryClient=useQueryClient()
    const mutation=useMutation<ResponseType,Error,RequestType>({
        mutationFn:async({param,json})=>{
            const response=await client.api.workspaces[":workspaceId"]["join"]["$post"]({param,json});
            if(!response.ok){
                throw new Error("Failed to join the workspace ");}

            return await response.json();
        },
        onSuccess:({data})=>{
            toast.success("Joined Workspace");
            queryClient.invalidateQueries({queryKey:["workspaces"]});
            queryClient.invalidateQueries({queryKey:["workspace",data.$id]});
        },
        onError:()=>{
            toast.error("Failed to join the workspace");
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
