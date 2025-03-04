"use client"

import { RiAddCircleFill } from "react-icons/ri";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces"
import { Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue } from "@/components/ui/select";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspace-avatar";
import { useRouter } from "next/navigation";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";

export const WorkspacesSwitcher =()=>{
    const workspaceId=useWorkspaceId();
    const router =useRouter();
    const {data:workspaces,isPending}= useGetWorkspaces();
    const {isOpen, open, close,setIsOpen} = useCreateWorkspaceModal();

    const onSelect=(id:string)=>{
        router.push(`/workspaces/${id}`)
    }
    return (
        <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase text-neutral-500">Workspaces</p>
        <RiAddCircleFill onClick={open} className="size-5 text-neutral-500 cursor-pointer hover:opacity-75 transition" />
      </div>

      {isPending ? (
        <div className="w-full h-10 bg-neutral-200 rounded-md flex items-center justify-center">
          <div className="w-5 h-5 border-4 border-t-blue-500 border-gray-300 rounded-full animate-spin " />
        </div>
      ) : (
        <Select onValueChange={onSelect} value={workspaceId}>
          <SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
            <SelectValue placeholder="no workspace selected" />
          </SelectTrigger>
          <SelectContent>
            {workspaces?.documents.map((workspace) => (
              <SelectItem key={workspace.$id} value={workspace.$id}>
                <div className="flex justify-start items-center gap-3 font-medium">
                  <WorkspaceAvatar name={workspace.name} image={workspace.imageUrl} />
                  <span className="truncate">{workspace.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
    )
}