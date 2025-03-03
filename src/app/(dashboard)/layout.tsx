import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { CreateWorkspaceModal } from "@/features/workspaces/components/creat-workspace.modal"

interface DashboardLayoutProps{
    children:React.ReactNode
}

const DashboardLayout =({children}:DashboardLayoutProps)=>{
    return(
        <div className=" min-h-screen">
            <CreateWorkspaceModal/>
            <div className="flex w-full h-full">
                <div className="fixed hidden left-0 top-0 lg:block lg:w-[264px] h-full overflow-auto">
                    <Sidebar/>
                </div>
                <div className=" lg:pl-[264px] w-full">
                    <div className="mx-auto max-w-screen-2xl h-full">
                    <Navbar/>
                    <main className=" h-full py-8 flex flex-col">
                {children}
                    </main>
                    </div>
                </div>
            </div>  
        </div>
    )
}

export default DashboardLayout