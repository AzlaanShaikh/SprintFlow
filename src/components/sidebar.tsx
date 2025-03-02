import Image from "next/image"
import Link from "next/link"
import { DottedSeparator } from "./dotted-seperator"
import { Navigation } from "./navigation"
import { WorkspacesSwitcher } from "./workspace-switcher"

export const Sidebar=()=>{
    return(
        <aside className=" h-full bg-neutral-100 p-4 w-full">
            <Link href={"/"}>
            <Image alt="lgog "src="/logo.png" width={164} height={48}/></Link>
            <DottedSeparator className=" my-4"/>
            <WorkspacesSwitcher/>
            <DottedSeparator className=" my-4"/>
            <Navigation/>
        </aside>
    )
} 