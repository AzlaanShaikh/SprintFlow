import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType,InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType=InferResponseType<typeof client.api.members[":memberId"]["$delete"],200>
type RequestType=InferRequestType<typeof client.api.members[":memberId"]["$delete"]>;

export const useDeleteMembers=()=>{
    const queryClient=useQueryClient()
    const mutation=useMutation<ResponseType,Error,RequestType>({
        mutationFn:async({param})=>{
            const response=await client.api.members[":memberId"]["$delete"]({param});
            if(!response.ok){
                throw new Error("Failed to delete member");}

            return await response.json();
        },
        onSuccess:()=>{
            toast.success("member deleeted successfully");
            queryClient.invalidateQueries({queryKey:["members"]});
        },
        onError:(error)=>{
            toast.error("Failed to delete member");
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
