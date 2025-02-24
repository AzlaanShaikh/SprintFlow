"use client"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface AuthLayoutProps{
    children:React.ReactNode
}

const AuthLayout = ({children}:AuthLayoutProps) => {

    const pathname =usePathname();
    return ( 
        <main className="bg-neutral-100 min-h-screen ">
            <div className="mx-auto max-w-screen-2xl p-4">
                <nav className="flex items-center justify-between">
                <Image src="/logo.png" height={56} width={152} alt="Logo"/>
                <Button asChild variant="secondary" >
                    <Link href={pathname==="/sign-in" ?"/sign-up":"/sign-in"}>
                {pathname ==="/sign-in" ? "Sign Up" : "Sign In"}
                </Link>
                </Button>
                </nav>
            
             <div className="flex flex-col items-center justify-center pt-4 md:pt-14">
                {children}
            </div>
            </div>
        </main>
     );
}
 
export default AuthLayout;