import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType,InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType=InferResponseType<typeof client.api.workspaces[":workspaceId"]["$patch"], 200>
type RequestType=InferRequestType<typeof client.api.workspaces[":workspaceId"]["$patch"]>;

export const useUpdateWorksapce=()=>{
    const queryClient=useQueryClient()
    const mutation=useMutation<ResponseType,Error,RequestType>({
        mutationFn:async({form,param})=>{
            const response=await client.api.workspaces[":workspaceId"]["$patch"]({form,param});
            if(response.status!==200){
                throw new Error("Failed to update workspace");
            }
            
            return await response.json();
        },
        onSuccess:({data})=>{
            toast.success("Workspace updated successfully");
            queryClient.invalidateQueries({queryKey:["workspaces"]});
            queryClient.invalidateQueries({queryKey:["workspace",data.$id]});
        },
        onError:()=>{
            toast.error("Failed to update workspace");
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
