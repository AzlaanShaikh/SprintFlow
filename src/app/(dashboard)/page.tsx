
import { getCurrent } from "@/features/auth/action";

import { redirect } from "next/navigation";
import { CreateWorkspaceForm } from "@/features/workspaces/components/create-worspace-form";

export default async function Home() {
  const user= await getCurrent();

  if(!user) redirect("/sign-in");
 
  return (
   <div className=" bg-neutral-500 p-4 h-full">
      <CreateWorkspaceForm />
   </div>
  );
}
