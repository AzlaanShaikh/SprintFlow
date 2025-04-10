"use client";
import { cn } from "@/lib/utils"
import { SettingsIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import {GoCheckCircle, GoCheckCircleFill, GoHome,GoHomeFill} from "react-icons/go"

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id"
import { usePathname } from "next/navigation";


const routes =[
    {
        label:"Home",
        href:"",
        icon:GoHome,
        activeIcon:GoHomeFill

    },
    {
        label:"My Task",
        href:"/tasks",
        icon:GoCheckCircle,
        activeIcon:GoCheckCircleFill
    },
    {
        label:"Setting",
        href:"/settings",
        icon:SettingsIcon,
        activeIcon:SettingsIcon
    },
    {
        label:"Members",
        href:"/members",
        icon:UserIcon,
        activeIcon:UserIcon
    }
]

export const Navigation=()=>{
    const workspaceId=useWorkspaceId();
    const pathname=usePathname();
    return(
        <ul className="flex flex-col">
            {routes.map((item)=>{
                const fullHref=`/workspaces/${workspaceId}${item.href}`;
                const isActive=pathname===fullHref;
                const Icon=isActive ? item.activeIcon :item.icon;
                return(
                    <Link href={fullHref} key={item.href}>
                        <div className={cn(
                            "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
                            isActive&& "bg-white hover:opacity-100 text-primary"
                        )}>
                            <Icon className=" size-5 to-neutral-500"/>
                            {item.label}
                        </div>
                    </Link>
                )
            })}
        </ul>
    )
}