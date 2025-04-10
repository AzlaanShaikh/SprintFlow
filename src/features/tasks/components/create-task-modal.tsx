"use client";
import { ResponsiveModal } from "@/components/responsive-modal";
import { useCreateTasktModal } from "../hooks/use-create-task-modal";
import { CreateTaskFormWrapper } from "./create-task-form-wrapper";

export const CreateTaskModal = () => {
    const {isOpen,close} = useCreateTasktModal();
  
  
  return (
  <ResponsiveModal open={isOpen} onOpenChange={(open) => {
    if (!open) close(); // Ensures status is cleared when modal closes
}}>
    <div>
        <CreateTaskFormWrapper onCancel={close} />
    </div>
  </ResponsiveModal>

)
}