"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
   ColumnDef,
   flexRender,
   getCoreRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import {
   MoreHorizontal,
   Eye,
   Trash2,
   ChevronsLeft,
   ChevronsRight,
   ChevronLeft,
   ChevronRight,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";

export type LiveAlert = {
   _id: string;
   category: string;
   location: string;
   alertLevel: string;
   latitude?: number;
   longitude?: number;
   userName: string;
   _creationTime: number;
   resolvedTime: number;
   status: string;
   description: string;
   relatedCategory?: string;
   responder?: string[];
};

const formatDate = (ms: number) => {
   try {
      return format(new Date(ms), "PP p");
   } catch (e) {
      return "-";
   }
};

const statusVariant = (
   status: string
): "default" | "secondary" | "destructive" => {
   if (!status) return "default";
   switch (status.toLowerCase()) {
      case "resolved":
         return "secondary";
      case "active":
         return "destructive";
      default:
         return "default";
   }
};

function AlertModal({
   open,
   onOpenChange,
   alert,
}: {
   open: boolean;
   onOpenChange: (v: boolean) => void;
   alert?: LiveAlert | null;
}) {
   const categoryToIcon: any = {
      "Health Emergency": "/health.png",
      "Crime or Security Threat": "/crime.png",
      "Fire Emergency": "/fire.png",
      "Flood or Weather Disaster": "/flood.png",
   };

   return (
      <Dialog open={open} onOpenChange={onOpenChange}>
         <DialogContent className="max-w-4xl font-poppins">
            {" "}
            <DialogHeader>
               <DialogTitle className="font-poppinsBold font-normal">
                  Alert details
               </DialogTitle>
            </DialogHeader>
            {alert ? (
               <div className="space-y-4">
                  <Card className="w-full">
                     <CardHeader>
                        <CardTitle className="flex items-center justify-between font-poppins">
                           <div className="flex items-center gap-3">
                              <img
                                 src={categoryToIcon[alert.category]}
                                 alt="Alert Icon"
                                 className="w-10 h-10"
                              />
                              <div className="flex flex-col">
                                 <span className="font-poppinsBold font-normal flex">
                                    {alert.category}
                                    <div
                                       className={`rounded-full ml-3 w-2 h-4 mr-3 ${
                                          alert.alertLevel === "Non-Urgent"
                                             ? "bg-[#51ad5d]"
                                             : alert.alertLevel === "Urgent"
                                               ? "bg-[#ffb300]"
                                               : alert.alertLevel ===
                                                   "Immediate"
                                                 ? "bg-[#ff4545]"
                                                 : "bg-gray-300"
                                       }`}
                                    />
                                    {alert.alertLevel}
                                 </span>
                                 <span className="text-sm font-normal font-poppins">
                                    {alert.userName}
                                 </span>
                              </div>
                           </div>
                        </CardTitle>
                     </CardHeader>

                     <CardContent className="font-poppins">
                        <div className="mb-3">
                           <span className="font-poppinsBold font-normal">
                              Status:
                           </span>{" "}
                           {alert.status}
                        </div>

                        <div className="mb-3">
                           <span className="font-poppinsBold font-normal">
                              Related Category:
                           </span>{" "}
                           {alert.relatedCategory}
                        </div>

                        <div className="mb-3">
                           <span className="font-poppinsBold font-normal">
                              Location:
                           </span>{" "}
                           {alert.location}
                        </div>

                        <div className="mb-3">
                           <span className="font-poppinsBold font-normal">
                              Date:
                           </span>{" "}
                           {formatDate(alert._creationTime)}
                        </div>

                        {alert.resolvedTime && (
                        <div className="mb-3">
                           <span className="font-poppinsBold font-normal">
                              Date Resolved:
                           </span>{" "}
                           {formatDate(alert.resolvedTime || 0)}
                        </div>
                        )}

                        <Separator />

                        <div className="mt-4 text-sm font-poppins">
                           <span className="font-poppinsBold font-normal">
                              Description:
                           </span>{" "}
                           {alert.description || "(No description)"}
                        </div>

                        {typeof alert.latitude === "number" &&
                           typeof alert.longitude === "number" && (
                              <div className="mt-2 text-sm text-muted-foreground font-poppins">
                                 <span className="font-poppinsBold font-normal">
                                    Coordinates:
                                 </span>{" "}
                                 {alert.latitude}, {alert.longitude}
                              </div>
                           )}

                        {alert.responder && alert.responder.length > 0 && (
                           <div className="mt-2 text-sm font-poppins">
                              <span className="font-poppinsBold font-normal">
                                 Responders:
                              </span>{" "}
                              {alert.responder.join(", ")}
                           </div>
                        )}
                     </CardContent>
                  </Card>
               </div>
            ) : (
               <div className="font-poppins">No data</div>
            )}
         </DialogContent>
      </Dialog>
   );
}

const columns: ColumnDef<LiveAlert>[] = [
   {
      accessorKey: "category",
      header: "Category",
      cell: (props) => (
         <div className="font-medium">{props.getValue() as string}</div>
      ),
   },
   {
      accessorKey: "relatedCategory",
      header: "Related Category",
      cell: (props) => (
         <div className="font-medium max-w-50 block truncate">
            {props.getValue() as string}
         </div>
      ),
   },
   {
      accessorKey: "alertLevel",
      header: "Alert Level",
      cell: ({ row }) => {
         const s = row.getValue("alertLevel") as string;

         const colorClass =
            s === "Non-Urgent"
               ? "bg-[#42a145] text-white dark:bg-[#368038] w-22"
               : s === "Urgent"
                 ? "bg-[#f0b800] text-white dark:bg-[#cb8e00] w-22"
                 : s === "Immediate"
                   ? "bg-[#de3125] text-white dark:bg-[#b8281f] w-22"
                   : "bg-gray-300 text-black";

         return <Badge className={colorClass}>{s}</Badge>;
      },
   },
   {
      accessorKey: "location",
      header: "Location",
      cell: (props) => (
         <span className="max-w-35 block truncate">
            {props.getValue() as string}
         </span>
      ),
   },
   {
      accessorKey: "userName",
      header: "Reported By",
   },
   {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
         const s = row.getValue("status") as string;
         return <Badge className="w-18" variant={statusVariant(s)}>{s}</Badge>;
      },
   },
   {
      accessorKey: "responder",
      header: "Responder",
      cell: ({ row }) => {
         const value = row.getValue("responder");
         const text = Array.isArray(value) ? value.join(", ") : value || "";

         return (
            <span
               className="block min-w-20 max-w-30 truncate"
               title={String(text)}
            >
               {String(text)}
            </span>
         );
      },
   },
   {
      accessorKey: "_creationTime",
      header: "Date Reported",
      cell: ({ getValue }) => formatDate(getValue() as number),
   },
   {
      accessorKey: "resolvedTime",
      header: "Date Resolved",
      cell: ({ getValue }) => {
        const value = getValue() as number | undefined | null;
        return value ? formatDate(value) : "";
      },
    },
   {
      id: "actions",
      header: "",
      cell: ({ row }) => {
         const alert = row.original;
         return (
            <div className="flex justify-end">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="p-1">
                        <MoreHorizontal />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuItem
                        data-action="view"
                        data-alert-id={alert._id}
                     >
                        <Eye className="mr-2 h-4 w-4" /> View
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        data-action="delete"
                        data-alert-id={alert._id}
                     >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         );
      },
   },
];

export function AlertsTable({ data }: { data: LiveAlert[] }) {
   const updateAlertStatus = useMutation(api.alerts.updateAlert);
   const deleteAlert = useMutation(api.alerts.deleteAlert);

   const [globalFilter, setGlobalFilter] = useState("");
   const [sorting, setSorting] = useState<any[]>([]);

   const [modalOpen, setModalOpen] = useState(false);
   const [selected, setSelected] = useState<LiveAlert | null>(null);

   const table = useReactTable({
      data,
      columns,
      state: { globalFilter, sorting },
      onGlobalFilterChange: setGlobalFilter,
      onSortingChange: setSorting,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),

      enableGlobalFilter: true,
      enableFilters: true,
      getColumnCanGlobalFilter: () => true,

      globalFilterFn: (row, columnId, filterValue) => {
         const rawValue = row.getValue(columnId);

         if (Array.isArray(rawValue)) {
            return rawValue
               .join(", ")
               .toLowerCase()
               .includes(filterValue.toLowerCase());
         }

         return String(rawValue ?? "")
            .toLowerCase()
            .includes(filterValue.toLowerCase());
      },
   });

   const handleResolve = async (id: string) => {
      try {
         await updateAlertStatus({
            id: id as Id<"alerts">,
            status: "Resolved",
         });
      } catch (err) {
         console.error(err);
      }
   };

   const handleDelete = async (id: string) => {
      if (!confirm("Are you sure you want to delete this alert?")) return;
      try {
         await deleteAlert({ id: id as Id<"alerts"> });
      } catch (err) {
         console.error(err);
      }
   };

   const onActionClick = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const item = target.closest("[data-action]") as HTMLElement | null;
      if (!item) return;
      const action = item.getAttribute("data-action");
      const id = item.getAttribute("data-alert-id")!;
      const row = data.find((d) => d._id === id);

      if (action === "view") {
         setSelected(row || null);
         setModalOpen(true);
      }
      if (action === "resolve") {
         handleResolve(id);
      }
      if (action === "delete") {
         handleDelete(id);
      }
   };

   return (
      <div onClick={onActionClick} className="space-y-4">
         <div className="flex items-center justify-between gap-4">
            <Input
               placeholder="Search alerts"
               value={globalFilter}
               onChange={(e) => setGlobalFilter(e.target.value)}
               className="max-w-lg"
            />

            <div className="flex items-center gap-2">
            </div>
         </div>

         <div className="rounded-md border">
            <Table>
               <TableHeader className="bg-muted">
                  {table.getHeaderGroups().map((hg) => (
                     <TableRow key={hg.id} className="font-poppinsBold">
                        {hg.headers.map((header) => (
                           <TableHead key={header.id}>
                              {flexRender(
                                 header.column.columnDef.header,
                                 header.getContext()
                              )}
                           </TableHead>
                        ))}
                     </TableRow>
                  ))}
               </TableHeader>

               <TableBody>
                  {table.getRowModel().rows?.length ? (
                     table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} className="font-poppins">
                           {row.getVisibleCells().map((cell) => (
                              <TableCell key={cell.id}>
                                 {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                 )}
                              </TableCell>
                           ))}
                        </TableRow>
                     ))
                  ) : (
                     <TableRow>
                        <TableCell
                           colSpan={columns.length}
                           className="text-center"
                        >
                           No results.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </div>

         <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
               Page {table.getState().pagination.pageIndex + 1} of{" "}
               {table.getPageCount()}
            </div>

            <div className="flex items-center gap-2">
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
               >
                  <ChevronsLeft />
               </Button>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
               >
                  <ChevronLeft />
               </Button>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
               >
                  <ChevronRight />
               </Button>
               <Button
                  variant="outline"
                  size="sm"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
               >
                  <ChevronsRight />
               </Button>
            </div>
         </div>

         <AlertModal
            open={modalOpen}
            onOpenChange={setModalOpen}
            alert={selected}
         />
      </div>
   );
}

export default AlertsTable;
