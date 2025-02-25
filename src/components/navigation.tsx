import { cn } from "@/lib/utils"
import { SettingsIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import {GoCheckCircle, GoCheckCircleFill, GoHome,GoHomeFill} from "react-icons/go"

const routes =[
    {
        label:"Home",
        href:"",
        icon:GoHome,
        activeIcon:GoHomeFill

    },
    {
        label:"My Task",
        href:"/task",
        icon:GoCheckCircle,
        activeIcon:GoCheckCircleFill
    },
    {
        label:"Setting",
        href:"/setting",
        icon:SettingsIcon,
        activeIcon:SettingsIcon
    },
    {
        label:"Members",
        href:"/member",
        icon:UserIcon,
        activeIcon:UserIcon
    }
]

export const Navigation=()=>{
    return(
        <ul className="flex flex-col">
            {routes.map((item)=>{
                const isActive=false;
                const Icon=isActive ? item.activeIcon :item.icon;
                return(
                    <Link href={item.href} key={item.href}>
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