import { AlertTriangle } from "lucide-react";

interface PageErrorProps {
    message: string;
}

export const PageError =({
    message= "Something went wrong"
}: PageErrorProps) => {
    return(
        <div className="flex items-center justify-center h-full">
            <AlertTriangle className="size-6 text-red-500 mb-2" />
            <h1 className="text-2xl font-bold text-red-500">{message}</h1>
        </div>
    )
}