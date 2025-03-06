"use-client"
import { DottedSeparator } from "@/components/dotted-seperator";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import Link from "next/link";
import { useJoinWorkspace } from "../api/use-join-workspace";
import { useInviteCode } from "../hooks/use-invite-code";
import { useWorkspaceId } from "../hooks/use-workspace-id";
import { useRouter } from "next/navigation";

  interface JoinWorkspaceFormProps{
    initailValues:{
        name:string;
    };
  };

  export const JoinWorkspaceForm=({initailValues}:JoinWorkspaceFormProps)=>{
    const router=useRouter()
    const workspaceId=useWorkspaceId()
    const inviteCode=useInviteCode()
    const {mutate,isPending}=useJoinWorkspace();

    const onSumbit=()=>{
        mutate({
            param:{workspaceId},
            json:{code:inviteCode}
        },
    {
        onSuccess:({data})=>{
            router.push(`/workspaces/${data.$id}`)
        }
    })
    }
    return (
        <Card className=" w-full h-full border-none shadow-none">
            <CardHeader className=" p-7">
                <CardTitle>
                    Join Workspace
                </CardTitle>
                <CardDescription>
                    You&apos;ve been invited to join <strong>{initailValues.name}</strong>
                </CardDescription>
            </CardHeader>
            <div className=" px-7">
                <DottedSeparator/>
            </div>
            <CardContent className="p-7">
                <div className="flex items-center justify-between gap-2">
                    <Button 
                    className=" w-full lg:w-fit"
                    size={"lg"} 
                    variant={"secondary"}
                    type="button"
                    asChild
                    disabled={isPending}
                    >
                        <Link href={"/"}>
                        Cancel
                        </Link>
                    </Button>
                    <Button 
                    className="w-full lg:w-fit"
                    size={"lg"}
                    type="button"
                    onClick={onSumbit}
                    disabled={isPending}
                    >Join Workspace</Button>
                </div>
            </CardContent>
        </Card>
    )
  }