import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType,InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType=InferResponseType<typeof client.api.auth.logout["$post"]>


export const useLogout=()=>{
    const router =useRouter();
    const queryClient=useQueryClient();

    const mutation=useMutation<ResponseType,Error>({
        mutationFn:async()=>{
            const response=await client.api.auth.logout["$post"]();
            if(!response.ok){
                throw new Error("Failed to logout")
            }   
            return await response.json();
        },
        onSuccess:()=>{
            toast.success("Logout successful");
            router.refresh();
            queryClient.invalidateQueries({queryKey:["current"]})
            queryClient.invalidateQueries({queryKey:["workspaces"]})
        },
        onError:(error)=>{
            toast.error("Failed to logout")
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
