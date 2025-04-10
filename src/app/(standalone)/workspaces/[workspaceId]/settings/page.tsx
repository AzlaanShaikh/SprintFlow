import { getCurrent } from "@/features/auth/queries";
import { redirect } from "next/navigation"; 
import WorkspaceSettingsClient from "./client";



const WorkspaceIdSettingPage = async() => {
    const user= await getCurrent();
      if(!user) redirect("/sign-in");


      
    return ( 
        <WorkspaceSettingsClient/>
     );
}
 
export default WorkspaceIdSettingPage;