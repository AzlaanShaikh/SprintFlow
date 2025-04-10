import{
    format,
    getDay,
    parse,
    startOfWeek,
    addMonths,
    subMonths,
} from "date-fns"

import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import {enUS} from "date-fns/locale"

import {Calendar,dateFnsLocalizer} from "react-big-calendar"

import { Task } from "../types";

import { useState } from "react";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css"
import { EventCard } from "./event-card";
import { Button } from "@/components/ui/button";

const locales ={
    "en-US": enUS,
};
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

interface DataCalendarProps {
    data: Task[];
}

interface CustomToolbarProps {
    date: Date;
    onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}
const CustomToolbar = ({date, onNavigate}:CustomToolbarProps) => {
    return (
        <div className=" flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
            <Button 
            onClick={() => onNavigate("PREV")}
            variant="secondary"
            size={"icon"}
            >
                <ChevronLeftIcon className="size-4 "/>
            </Button>
            <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto">
                <CalendarIcon className="size-5 mr-2"/>
                <p className="text-sm">{format(date,"MMMM yyyy")}</p>
            </div>
            <Button 
            onClick={() => onNavigate("NEXT")}
            variant="secondary"
            size={"icon"}
            
            >
                <ChevronRightIcon className="size-4 "/>
            </Button>
        </div>
    )
}

export const DataCalendar = ({ data }: DataCalendarProps) => {
    const [values,setValue]= useState(
        data.length>0 ? new Date(data[0].dueDate): new Date()
    );

    const events = data.map((task) => ({
        start: new Date(task.dueDate),
        end: new Date(task.dueDate),
        title: task.name,
        project: task.project,
        status: task.status,
        assignee: task.assignee,
        id: task.$id,
    }));

    const handleNavigate =(action:"PREV" | "NEXT" | "TODAY") => {
        if (action === "PREV") {
            setValue(subMonths(values, 1));
        } else if (action === "NEXT") {
            setValue(addMonths(values, 1));
        } else {
            setValue(new Date());
        }
    }
    return (
        <Calendar
        localizer={localizer}
        date={values}
        events={events}
        views={["month"]}
        defaultView="month"
        toolbar
        showAllEvents
        className="h-full w-full"
        max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
        formats={{
            weekdayFormat:(date,culture,localizer) => {
                return localizer?.format(date, "EEE", culture) ?? "";
            }
        }}
        components={{
           eventWrapper:({event})=>(
            <EventCard
             id={event.id}
             title={event.title}
             assignee={event.assignee}
                project={event.project}
                status={event.status}
            />
           ), 
           toolbar:()=>(
            <CustomToolbar date={values} onNavigate={handleNavigate}/>
           )
        }}
        
        />
    )
}