import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SheetStore } from "./store/sheet-store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";

export function AlertSheet() {
  const { open, closeSheet, selectedAlert } = SheetStore();
  const updateAlert = useMutation(api.alerts.updateAlert);
  const deleteAlert = useMutation(api.alerts.deleteAlert);

  const [status, setStatus] = useState("active");
  const [description, setDescription] = useState("");
  const [responder, setResponder] = useState("");

  useEffect(() => {
    if (selectedAlert) {
      setStatus(selectedAlert.status || "active");
      setDescription(selectedAlert.description || "");
      setResponder(selectedAlert.responder || "");
    }
  }, [selectedAlert]);

  console.log("selectedAlert", selectedAlert);


  if (!selectedAlert) return null;

  const handleUpdate = async () => {
    await updateAlert({
      id: selectedAlert._id,
      status,
      description,
      responder,
    });
    closeSheet();
  };

  const handleDelete = async () => {
    await deleteAlert({ id: selectedAlert._id });
    closeSheet();
  };

  return (
    <Sheet open={open} onOpenChange={closeSheet}>
      <SheetContent className="p-6">
        <SheetHeader className="p-0">
          <SheetTitle className="text-lg">Manage Alert</SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          <Label>Type</Label>
          <Input value={selectedAlert.category} disabled />

          <Label>Location</Label>
          <Input value={selectedAlert.location} disabled />

          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Label>Description</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <Label>Assign Responder</Label>
          <Select value={responder} onValueChange={setResponder}>
            <SelectTrigger>
              <SelectValue placeholder="Select responder..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="responder1">Barangay Healthcare</SelectItem>
              <SelectItem value="responder2">Barangay Rescue Team</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <SheetFooter className="flex flex-row p-0 mt-4 gap-2">
          <Button variant="destructive" onClick={handleDelete}>
            Delete Alert
          </Button>
          <Button className="flex-1" onClick={handleUpdate}>
            Update Alert
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
