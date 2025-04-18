import { FaCaretDown,FaCaretUp } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { Card,
    CardDescription,
    CardHeader,
    CardTitle
 } from "@/components/ui/card";



interface AnalyticsCardProps {
    title: string;
    value: number;
    variant:"up"|"down";
    increaseValue: number;

}

export const AnalyticsCard = ({ title, value, variant,increaseValue }: AnalyticsCardProps) => {

    const iconColor = variant === "up" ? "text-green-500" : "text-red-500";
    const increaseValueColor = variant === "up" ? "text-green-500" : "text-red-500";
    const increaseValueIcon = variant === "up" ? <FaCaretUp className={cn("size-4",iconColor)}/> : <FaCaretDown className={cn("size-4",iconColor)}/>;
    return (
        <Card className="shadow-none border-none w-full">
            <CardHeader>
                <div className="flex items-center gap-x-2.5">
                    <CardDescription className="flex items-center gap-x-2 font-medium overflow-hidden">
                        <span className=" truncate text-base">{title}</span>
                    </CardDescription>
                    <div className="flex items-center gap-x-1">
                        {increaseValueIcon}
                        <span className={cn(increaseValueColor,"truncate text-base font-medium")}>{increaseValue}
                        </span>
                    </div>
                </div>
                <CardTitle className="text-3xl font-bold">{value}</CardTitle>
            </CardHeader>
        </Card>
    )
}
