import { ProjectAnalyticsResponseType } from "@/features/projects/api/use-get-projects-analytics"
import { ScrollArea ,ScrollBar} from "./ui/scroll-area"
import { AnalyticsCard } from "./analytics-card"
import { DottedSeparator } from "./dotted-seperator"

export const Analytics = ({data}:ProjectAnalyticsResponseType) => {
    return (
        <ScrollArea className="border rounded-lg w-full whitespace-nowrap shrink-0">
            <div className="w-full flex flex-row">
                <div className="flex items-center flex-1">
                    <AnalyticsCard 
                    title="Total Tasks"
                    value={data.taskCount}
                    variant={data.taskdifference>0?"up":"down"}
                    increaseValue={data.taskdifference}
                    />
                    <DottedSeparator direction="vertical"/>
                </div>
                <div className="flex items-center flex-1">
                    <AnalyticsCard 
                    title="Assigned Tasks"
                    value={data.assignedTaskCount}
                    variant={data.assignedTaskDifference>0?"up":"down"}
                    increaseValue={data.assignedTaskDifference}
                    />
                    <DottedSeparator direction="vertical"/>
                </div>
                <div className="flex items-center flex-1">
                    <AnalyticsCard 
                    title="Completed Tasks"
                    value={data.completeTaskCount}
                    variant={data.completeTaskDifference>0?"up":"down"}
                    increaseValue={data.completeTaskDifference}
                    />
                    <DottedSeparator direction="vertical"/>
                </div>
                <div className="flex items-center flex-1">
                    <AnalyticsCard 
                    title="OverDue Tasks"
                    value={data.OverdueTaskCount}
                    variant={data.OverdueTaskDifference>0?"up":"down"}
                    increaseValue={data.OverdueTaskDifference}
                    />
                    <DottedSeparator direction="vertical"/>
                </div>
                <div className="flex items-center flex-1">
                    <AnalyticsCard 
                    title="Incomplete Tasks"
                    value={data.incompleteTaskCount}
                    variant={data.incompleteTaskDifference>0?"up":"down"}
                    increaseValue={data.incompleteTaskDifference}
                    />
                    
                </div>


            </div>
            <ScrollBar orientation="horizontal"/>
        </ScrollArea>
    )
}