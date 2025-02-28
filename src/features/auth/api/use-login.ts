import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { InferRequestType,InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type ResponseType=InferResponseType<typeof client.api.auth.login["$post"]>
type RequestType=InferRequestType<typeof client.api.auth.login["$post"]>;

export const useLogin=()=>{
    const queryClient=useQueryClient()
    const router =useRouter()
    const mutation=useMutation<ResponseType,Error,RequestType>({
        mutationFn:async({json})=>{
            const response=await client.api.auth.login["$post"]({json});
            if(!response.ok){
                throw new Error("Failed to login") }
            
            return await response.json();
        },
        onSuccess:()=>{
            toast.success("Login successful")
            router.refresh()
            // queryClient.invalidateQueries({queryKey:["current"]});
        },
        onError:(error)=>{
            toast.error("Failed to login")
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
