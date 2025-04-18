import { useMutation,  useQueryClient } from "@tanstack/react-query";
import { InferRequestType,InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";



type ResponseType=InferResponseType<typeof client.api.projects[":projectId"]["$delete"], 200>
type RequestType=InferRequestType<typeof client.api.projects[":projectId"]["$delete"]>;

export const useDeleteProject=()=>{
    
    const queryClient=useQueryClient()
    const mutation=useMutation<ResponseType,Error,RequestType>({
        mutationFn:async({param})=>{
            const response=await client.api.projects[":projectId"]["$delete"]({param});
            if(response.status!==200){
                throw new Error("Failed to delete project");
            }
            
            return await response.json();
        },
        onSuccess:({data})=>{
            toast.success("Project deleted successfully");
            
            queryClient.invalidateQueries({queryKey:["projects"]});
            queryClient.invalidateQueries({queryKey:["project",data.$id]});
        },
        onError:()=>{
            toast.error("Failed to delete workspace");
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
