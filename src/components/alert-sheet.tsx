import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
   Dialog,
   DialogContent,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
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
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "./ui/card";
import {
   DialogClose,
   DialogDescription,
   DialogTrigger,
} from "@radix-ui/react-dialog";

export function AlertSheet() {
   const { open, closeSheet, selectedAlert } = SheetStore();
   const updateAlert = useMutation(api.alerts.updateAlert);
   const deleteAlert = useMutation(api.alerts.deleteAlert);
   const updateUsername = useMutation(api.alerts.updateUsername);
   const [isEditingUsername, setIsEditingUsername] = useState(false);

   const [status, setStatus] = useState("Active");
   const [description, setDescription] = useState("");
   const [username, setUsername] = useState("");

   const categoryToIcon: any = {
      "Health Emergency": "/health.png",
      "Crime or Security Threat": "/crime.png",
      "Fire Emergency": "/fire.png",
      "Flood or Weather Disaster": "/flood.png",
   };

   useEffect(() => {
      if (selectedAlert) {
         setStatus(selectedAlert.status || "Active");
         setDescription(selectedAlert.description || "");
         setUsername(selectedAlert.userName);
         setIsEditingUsername(false);
      }
   }, [selectedAlert]);

   console.log("selectedAlert", selectedAlert);

   if (!selectedAlert) return null;

   const handleUpdate = async () => {
      await updateAlert({
         id: selectedAlert._id,
         status,
         description,
      });
      await updateUsername({
         id: selectedAlert._id,
         username,
      });
      toast.success("Alert updated successfully");
      closeSheet();
   };

   const handleDelete = async () => {
      await deleteAlert({ id: selectedAlert._id });
      toast.success("Alert deleted");
      closeSheet();
   };

   return (
      <Dialog open={open} onOpenChange={closeSheet}>
         <DialogContent className="p-5">
            <DialogHeader className="p-0">
               <DialogTitle className="font-poppinsBold font-normal text-lg flex items-center">
                  Manage Alert{" "}
                  <div
                     className={`rounded-full ml-3 w-2 h-5 mr-3 ${
                        selectedAlert.alertLevel === "Non-Urgent"
                           ? "bg-[#51ad5d]"
                           : selectedAlert.alertLevel === "Urgent"
                             ? "bg-[#ffb300]"
                             : selectedAlert.alertLevel === "Immediate"
                               ? "bg-[#ff4545]"
                               : "bg-gray-300"
                     }`}
                  />
                  {selectedAlert.alertLevel === "Non-Urgent" ||
                  selectedAlert.alertLevel === "Urgent" ||
                  selectedAlert.alertLevel === "Immediate"
                     ? selectedAlert.alertLevel
                     : ""}
               </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 px-3 -mt-4">
               <div className="flex mt-8 mb-6 items-center">
                  <img
                     src={categoryToIcon[selectedAlert.category]}
                     alt="Alert Icon"
                     className="w-10 h-10 mr-4"
                  />
                  <div className="flex">
                     {selectedAlert.relatedCategory
                        ?.split(",")
                        .map((label: string) => label.trim())
                        .filter((label: string) => categoryToIcon[label])
                        .map((label: string, index: number) => (
                           <img
                              key={index}
                              src={categoryToIcon[label]}
                              alt={label}
                              className="w-9 h-9 mt-0.5 -ml-1.5 mr-3.5"
                              title={label}
                           />
                        ))}
                  </div>
                  <div className="-mt-1">
                     {isEditingUsername ? (
                        <div className="-mt-1 flex items-center gap-2">
                           <input
                              type="text"
                              className="border rounded px-2 py-1 text-sm font-poppins"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                           />
                           <Button
                              size="sm"
                              onClick={async () => {
                                 if (username.trim() !== "") {
                                    await updateUsername({
                                       id: selectedAlert._id,
                                       username,
                                    });
                                    toast.success("User name updated");
                                    setIsEditingUsername(false);
                                 }
                              }}
                           >
                              Save
                           </Button>
                           <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setIsEditingUsername(false)}
                           >
                              Cancel
                           </Button>
                        </div>
                     ) : (
                        <div className="-mt-1 flex items-center gap-2">
                           <p className="font-poppinsBold text-lg -mb-1">
                              {username}
                           </p>
                           {username === "Unknown" && (
                              <Button
                                 size="sm"
                                 variant="outline"
                                 onClick={() => setIsEditingUsername(true)}
                              >
                                 Edit
                              </Button>
                           )}
                        </div>
                     )}
                     <div>
                        <p className="font-poppins text-sm">
                           {selectedAlert.location}
                        </p>
                        <p className="font-poppins text-sm">
                           {selectedAlert.contactNumber}
                        </p>
                     </div>
                  </div>
               </div>

               <div className="space-y-3">
                  <Label className="font-poppinsBold">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                     <SelectTrigger
                     >
                        <SelectValue placeholder="Status" />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                     </SelectContent>
                  </Select>
               </div>

               <div className="space-y-3">
                  <Label className="font-poppinsBold">Description</Label>
                  <Textarea
                     value={description}
                     onChange={(e) => setDescription(e.target.value)}
                  />
               </div>

               <div className="space-y-0">
                  <Label className="mt-10 font-poppinsBold -mb-2">
                     Responder Numbers
                  </Label>
                  <Card className="-space-y-1 border-0 shadow-none -mb-4">
                     {(selectedAlert.category === "Health Emergency" ||
                        selectedAlert.relatedCategory?.includes(
                           "Health Emergency"
                        )) && (
                        <CardHeader className="flex justify-between items-center">
                           <div className="space-y-2">
                              <CardTitle className="font-poppinsBold font-normal text-xs">
                                 General Natividad Rural Health Unit
                              </CardTitle>
                              <div className="ml-3 -mt-1">
                                 <div className="flex gap-3 items-center">
                                    <i className="font-poppins text-xs">
                                       0932 739 1777
                                    </i>
                                    <p className="absolute ml-28 text-xs text-gray-500">
                                       Sun
                                    </p>
                                 </div>
                              </div>
                           </div>
                        </CardHeader>
                     )}

                     {(selectedAlert.category === "Fire Emergency" ||
                        selectedAlert.category ===
                           "Flood or Weather Disaster" ||
                        selectedAlert.relatedCategory?.includes(
                           "Fire Emergency"
                        ) ||
                        selectedAlert.relatedCategory?.includes(
                           "Flood or Weather Disaster"
                        )) && (
                        <CardHeader className="flex justify-between items-center">
                           <div className="space-y-2">
                              <CardTitle className="font-poppinsBold font-normal text-xs">
                                 General Natividad Fire Station
                              </CardTitle>
                              <div className="ml-3  -mt-1">
                                 <div className="flex gap-3 items-center">
                                    <i className="font-poppins text-xs">
                                       0932-500-7911
                                    </i>
                                    <p className="absolute ml-28 text-xs text-gray-500">
                                       Sun
                                    </p>
                                 </div>
                                 <div className="flex gap-3 items-center">
                                    <i className="font-poppins text-xs">
                                       0965-832-4308
                                    </i>
                                    <p className="absolute ml-28 text-xs text-gray-500">
                                       TM
                                    </p>
                                 </div>
                              </div>
                           </div>
                           {/* <img
                              src="/message.webp"
                              className="w-5 h-5 mt-3 bg-transparent cursor-pointer"
                              onClick={() => window.open("https://www.facebook.com/profile.php?id=61570875833978", "_blank")}
                           /> */}
                        </CardHeader>
                     )}

                     {(selectedAlert.category === "Crime or Security Threat" ||
                        selectedAlert.relatedCategory?.includes(
                           "Crime or Security Threat"
                        )) && (
                        <CardHeader className="flex justify-between items-center">
                           <div className="space-y-2">
                              <CardTitle className="font-poppinsBold font-normal text-xs">
                                 General Natividad Municipal Police Station
                              </CardTitle>
                              <div className="ml-3 -mt-1">
                                 <div className="flex gap-3 items-center">
                                    <i className="font-poppins text-xs">
                                       0998 598 5428
                                    </i>
                                    <p className="absolute ml-28 text-xs text-gray-500">
                                       Smart
                                    </p>
                                 </div>
                              </div>
                           </div>
                           {/* <img
                              src="/message.webp"
                              className="w-5 h-5 mt-3 bg-transparent cursor-pointer"
                              onClick={() => window.open("https://www.facebook.com/GeneralMamertoNatividadPS", "_blank")}
                           /> */}
                        </CardHeader>
                     )}
                  </Card>

                  {selectedAlert.responder.length > 0 && (
                     <>
                        <Label className="mt-10 font-poppinsBold -mb-2">
                           Responder
                        </Label>
                        <Card className="-space-y-1 border-0 shadow-none -mb-4">
                           <CardHeader className="flex justify-between items-center">
                              <div className="space-y-2">
                                 <CardTitle className="font-poppins text-xs font-normal">
                                    {selectedAlert.responder
                                       .map((res: string) => res)
                                       .join(", ") || "N/A"}
                                 </CardTitle>
                              </div>
                           </CardHeader>
                        </Card>
                     </>
                  )}
               </div>
            </div>

            <DialogFooter className="flex flex-row mt-4 gap-2">
               <Button className="flex-1 p-5" onClick={handleUpdate}>
                  Update Alert
               </Button>
               <Dialog>
                  <form>
                     <DialogTrigger asChild>
                        <Button variant="destructive">
                           <Trash />
                        </Button>
                     </DialogTrigger>
                     <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                           <DialogTitle className="font-poppinsBold font-normal text-md">
                              Are you sure you want to delete this alert?
                           </DialogTitle>
                           <DialogDescription>
                              <div className="flex m-4 mt-6">
                                 <img
                                    src={categoryToIcon[selectedAlert.category]}
                                    alt="Alert Icon"
                                    className="w-10 h-10 mr-4"
                                 />
                                 <div className="flex">
                                    {selectedAlert.relatedCategory
                                       ?.split(",")
                                       .map((label: string) => label.trim())
                                       .filter(
                                          (label: string) =>
                                             categoryToIcon[label]
                                       )
                                       .map((label: string, index: number) => (
                                          <img
                                             key={index}
                                             src={categoryToIcon[label]}
                                             alt={label}
                                             className="w-9 h-9 mt-0.5 -ml-1.5 mr-3.5"
                                             title={label}
                                          />
                                       ))}
                                 </div>
                                 <div className="-mt-1">
                                    <p className="font-poppinsBold">
                                       {selectedAlert.userName}
                                    </p>
                                    <p className="font-poppins text-sm">
                                       {selectedAlert.location}
                                    </p>
                                 </div>
                              </div>
                           </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                           <DialogClose asChild>
                              <Button className="flex-1" variant="outline">
                                 Cancel
                              </Button>
                           </DialogClose>
                           <Button
                              className="flex-1"
                              variant="destructive"
                              onClick={handleDelete}
                           >
                              Delete
                           </Button>
                        </DialogFooter>
                     </DialogContent>
                  </form>
               </Dialog>
            </DialogFooter>
         </DialogContent>
      </Dialog>
   );
}
