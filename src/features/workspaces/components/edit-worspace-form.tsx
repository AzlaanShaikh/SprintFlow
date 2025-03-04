"use client";
import { useForm } from "react-hook-form";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef } from "react";
import {z} from "zod";

import Image from "next/image";
import { Avatar,AvatarFallback,AvatarImage } from "@/components/ui/avatar";
import { Card,CardContent,CardDescription,CardTitle,CardHeader } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormLabel,
    FormField,
    FormItem,
    FormMessage,
  } from "@/components/ui/form"
import { DottedSeparator } from "@/components/dotted-seperator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Workspace } from "../types";
import { Arrow } from "@radix-ui/react-dropdown-menu";
import { useUpdateWorksapce } from "../api/use-update-workspace";

interface EditWorkspaceFormProps {
    onCancel?:()=>void;
    initialValues:Workspace
}

export const EditWorkspaceForm = ({onCancel,initialValues}:EditWorkspaceFormProps) => {
  const router =useRouter();

  const {mutate,isPending}=useUpdateWorksapce()

  const inputRef = useRef<HTMLInputElement>(null);
    const form =useForm<z.infer<typeof updateWorkspaceSchema>>({
        resolver:zodResolver(updateWorkspaceSchema),
        defaultValues:{
            ...initialValues,
            image:initialValues.image || "",
        }
    })

    const onSubmit=(values:z.infer<typeof updateWorkspaceSchema>)=>{
        const finalValues={
            ...values,
            image :values.image instanceof File ? values.image:"",
        }

        mutate({form:finalValues,
          param:{workspaceId:initialValues.$id}
        },{
          onSuccess:({data})=>{
            form.reset();
            router.push(`/workspaces/${data.$id}`)
            // TODO: Redirect to the workspace page
          }
    })
        
    }
    const handleImageChange=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const file = e.target.files?.[0];
        if (file) {
          form.setValue("image", file);
        }
    }

  return (
    <div className="flex flex-col gap-y-4 ">
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex  flex-row items-center gap-x-4 p-7 space-y-0">
        <Button size={"sm"} variant={"secondary"}onClick={onCancel ? onCancel :()=>router.back()}>
        <ArrowLeft className="size-4 mr-2" />
          Back
          
        </Button>
        <CardTitle className="text-xl font-bold">
            {initialValues.name}
        </CardTitle>
    </CardHeader>
    <div className="px-7">
        <DottedSeparator/>
    </div>
    <CardContent  className="p-7">
        <Form {...form} >
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col space-y-4">
            <FormField
            control={form.control}
            name="name"
            render={({field})=>(
              <FormItem>
                <FormLabel>
                  Worksapce Name
                </FormLabel>
                <FormControl>
                  <Input
                  {...field}
                  placeholder="Enter workspace name" />
                </FormControl>
              </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="image"
            render={({field})=>(
              <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-x-5">
                      {field.value ? (
                        <div className="size-[72px] relative rounded-md overflow-hidden" >
                          <Image
                          alt="logo"
                          fill 
                          className="object-cover"
                          src={field.value instanceof File ? URL.createObjectURL(field.value):field.value} />
                        </div>
            ):(
                        <Avatar className="size-[72px]">
                          <AvatarFallback>
                            <ImageIcon className="size-[36px] text-neutral-400"/>
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col gap-2">
                        <p className=" text-sm">Workspace Icon</p>
                        <p className=" text-sm text-muted-foreground">JPG, PNG, SVG OR JPEG, max 1mb</p>
                        <input 
                        className="hidden"
                        type="file" 
                        accept=".jpg,.jpeg,.png,.svg"
                        ref={inputRef}
                        onChange={handleImageChange}
                        disabled={isPending}
                        />
                         {field.value ? ( <Button
                        type="button"
                        disabled={isPending}
                        variant={"destructive"}
                        size="xs"
                        className="w-fit mt-2"
                        onClick={()=>{
                          field.onChange(null);
                          if(inputRef.current){
                            inputRef.current.value="";
                          }
                        }}
                        >Remove Image</Button>):(
                          <Button
                          type="button"
                          disabled={isPending}
                          variant={"teritary"}
                          size="xs"
                          className="w-fit mt-2"
                          onClick={()=>inputRef.current?.click()}
                          >Upload Image</Button>
                        )}
                      </div>
                  </div>
              </div>
            )}
            />
            </div>
            <DottedSeparator className="p-7"/>
            <div className="flex items-center justify-between">
              <Button
              type="button"
              size={"lg"}
              variant={"secondary"}
              onClick={onCancel}
              disabled={isPending}
              className={cn(onCancel && "invisible")}
              >
                  Cancel
              </Button>
              <Button
              type="submit"
              size={"lg"}
              variant={"primary"}
              disabled={isPending}
              >
                  Save Changes
              </Button>
            </div>
          </form>
        </Form>
    </CardContent>
    </Card>
    <Card className=" w-full h-full border-none shadow-none">
      <CardContent className="p-7">
            <div className="flex flex-col">
              <h3 className=" font-bold">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Deleting a workspace is irreversible. All data will be lost.
              </p>
              <Button className="mt-6 w-fit ml-auto" variant="destructive" size="sm"
              type="button"
              disabled={isPending}
              onClick={()=>{}}>
                Delete Workspace
              </Button>
            </div>
      </CardContent>

    </Card>
    </div>
  )
}
