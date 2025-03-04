
import { getCurrent } from "@/features/auth/queries";
import { SignUpCard } from "@/features/auth/components/sign-up-card";
import { redirect } from "next/navigation";
import { useRouter } from "next/router";
const SignUpPage = async() => {
   
    const user =await getCurrent();
    
        if(user) redirect("/")
    
    return ( 
        <div>
            <SignUpCard/>
        </div>
     );
}
 
export default SignUpPage;