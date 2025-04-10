import { useMutation,  useQueryClient } from "@tanstack/react-query";
import { InferRequestType,InferResponseType } from "hono";

import { client } from "@/lib/rpc";
import { toast } from "sonner";


type ResponseType=InferResponseType<typeof client.api.projects["$post"],200>
type RequestType=InferRequestType<typeof client.api.projects["$post"]>;

export const useCreateProject=()=>{
    const queryClient=useQueryClient()
    const mutation=useMutation<ResponseType,Error,RequestType>({
        mutationFn:async({form})=>{
            const response=await client.api.projects["$post"]({form});

            if(!response.ok){
                throw new Error("Failed to create Project")
            }
            
            return await response.json();
        },
        onSuccess:()=>{
            toast.success("Project Created");
            queryClient.invalidateQueries({queryKey:["projects"]});
        },
        onError:()=>{
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
