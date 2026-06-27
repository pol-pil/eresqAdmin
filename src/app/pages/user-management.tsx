"use client";

import * as React from "react";
import {
   ColumnDef,
   ColumnFiltersState,
   flexRender,
   getCoreRowModel,
   getFilteredRowModel,
   getPaginationRowModel,
   getSortedRowModel,
   SortingState,
   useReactTable,
   VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuCheckboxItem,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";

export type User = {
   _id: string;
   firstname: string;
   lastname: string;
   email: string;
   contactNumber: string;
   address: string;
   alerts: string;
   image: string;
   _creationTime: number;
   status: "approved" | "pending";
   role: string;
};

function DataTable({
   data,
   columns,
}: {
   data: User[];
   columns: ColumnDef<User>[];
}) {
   const [sorting, setSorting] = React.useState<SortingState>([]);
   const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
      []
   );
   const [columnVisibility, setColumnVisibility] =
      React.useState<VisibilityState>({});
   const [rowSelection, setRowSelection] = React.useState({});

   const table = useReactTable({
      data,
      columns,
      onSortingChange: setSorting,
      onColumnFiltersChange: setColumnFilters,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      onColumnVisibilityChange: setColumnVisibility,
      onRowSelectionChange: setRowSelection,
      enableRowSelection: true,
      state: {
         sorting,
         columnFilters,
         columnVisibility,
         rowSelection,
      },
   });

   return (
      <>
         <div className="flex items-center py-4">
            <Input
               placeholder="Search"
               value={
                  (table.getColumn("firstname")?.getFilterValue() as string) ??
                  ""
               }
               onChange={(event) =>
                  table
                     .getColumn("firstname")
                     ?.setFilterValue(event.target.value)
               }
               className="max-w-sm"
            />
            {Object.keys(rowSelection).length > 0 && (
               <div className="text-sm text-muted-foreground mt-2 ml-4">
                  {Object.keys(rowSelection).length} selected
               </div>
            )}
            <DropdownMenu>
               <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="ml-auto">
                     Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent align="end">
                  {table
                     .getAllColumns()
                     .filter((column) => column.getCanHide())
                     .map((column) => (
                        <DropdownMenuCheckboxItem
                           key={column.id}
                           className="capitalize"
                           checked={column.getIsVisible()}
                           onCheckedChange={(value) =>
                              column.toggleVisibility(!!value)
                           }
                        >
                           {column.id}
                        </DropdownMenuCheckboxItem>
                     ))}
               </DropdownMenuContent>
            </DropdownMenu>
         </div>

         <div className="overflow-hidden rounded-md border">
            <Table>
               <TableHeader className="bg-muted">
                  {table.getHeaderGroups().map((headerGroup) => (
                     <TableRow
                        key={headerGroup.id}
                        className="font-poppinsBold"
                     >
                        {headerGroup.headers.map((header) => (
                           <TableHead key={header.id}>
                              {header.isPlaceholder
                                 ? null
                                 : flexRender(
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
                        <TableRow
                           key={row.id}
                           data-state={row.getIsSelected() && "selected"}
                           className="font-poppins"
                        >
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
                           className="h-24 text-center"
                        >
                           No results.
                        </TableCell>
                     </TableRow>
                  )}
               </TableBody>
            </Table>
         </div>
      </>
   );
}

export default function UserManagement() {
   const users = useQuery(api.getUsers.getUsers) ?? [];
   const approvedUsers = users.filter((u) => u.status === "approved");
   const pendingUsers = users.filter((u) => u.status === "pending");

   const [openEdit, setOpenEdit] = React.useState(false);
   const [openDelete, setOpenDelete] = React.useState(false);
   const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
   const [isDeleting, setIsDeleting] = React.useState(false);

   const updateUser = useMutation(api.getUsers.updateUser);
   const deleteUser = useMutation(api.getUsers.deleteUser);

   const handleDeleteUser = async () => {
      if (!selectedUser) return;

      setIsDeleting(true);
      try {
         await deleteUser({
            userId: selectedUser._id as Id<"users">,
         });
         setOpenDelete(false);
         setSelectedUser(null);
      } catch (error) {
         console.error("Failed to delete user:", error);
         alert("Failed to delete user. Please try again.");
      } finally {
         setIsDeleting(false);
      }
   };

   // ⬇⬇⬇ MOVE COLUMNS **INSIDE** HERE ⬇⬇⬇
   const columns: ColumnDef<User>[] = [
      {
         id: "select",
      },
      {
         accessorKey: "firstname",
         header: ({ column }) => (
            <Button
               variant="ghost"
               onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
               }
               className="ml-9"
            >
               First Name
               <ArrowUpDown />
            </Button>
         ),
         cell: ({ row }) => {
            const image = row.original.image;
            const firstname = row.getValue("firstname") as string;
            return (
               <div className="flex items-center gap-2">
                  <img
                     src={image || "/placeholder-avatar.png"}
                     alt="User Avatar"
                     className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="ml-2">{firstname}</span>
               </div>
            );
         },
         filterFn: (row, _id, filterValue) => {
            const first = row.getValue("firstname") as string;
            const last = row.getValue("lastname") as string;
            return `${first} ${last}`
               .toLowerCase()
               .includes(filterValue.toLowerCase());
         },
      },
      {
         accessorKey: "lastname",
         header: ({ column }) => (
            <Button
               variant="ghost"
               onClick={() =>
                  column.toggleSorting(column.getIsSorted() === "asc")
               }
               className="-ml-3"
            >
               Last Name
               <ArrowUpDown />
            </Button>
         ),
      },
      {
         accessorKey: "contactNumber",
         header: "Contact Number",
         cell: ({ row }) => <div>{row.getValue("contactNumber")}</div>,
      },
      {
         accessorKey: "address",
         header: "Address",
      },
      {
         accessorKey: "role",
         header: ({ column }) => (
            <div className="flex items-center">
               <span>Role</span>
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="sm">
                        <ChevronDown className="h-4 w-4" />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                     <DropdownMenuItem
                        onClick={() => column.setFilterValue("")}
                     >
                        All
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onClick={() => column.setFilterValue("Resident")}
                     >
                        Resident
                     </DropdownMenuItem>
                     <DropdownMenuItem
                        onClick={() => column.setFilterValue("Responder")}
                     >
                        Responder
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         ),
         cell: ({ row }) => {
            const role = row.getValue("role") as string;
            return (
               <Badge
                  className={`${
                     role === "Responder" ? "bg-blue-500 dark:bg-blue-400" : ""
                  }`}
               >
                  {role}
               </Badge>
            );
         },
         filterFn: (row, id, filterValue) => {
            if (!filterValue) return true;
            return row.getValue(id) === filterValue;
         },
      },

      {
         accessorKey: "_creationTime",
         header: "Date Created",
         cell: ({ row }) => {
            const timestamp = row.getValue("_creationTime") as number;
            return new Date(timestamp).toLocaleString();
         },
      },
      {
         id: "actions",
         cell: ({ row }) => {
            const user = row.original;

            const approveUser = useMutation(api.getUsers.approveUser);

            return (
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                     </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                     <DropdownMenuItem
                        onClick={() => navigator.clipboard.writeText(user._id)}
                     >
                        Copy user ID
                     </DropdownMenuItem>

                     {user.status === "pending" && (
                        <DropdownMenuItem
                           onClick={() =>
                              approveUser({ userId: user._id as Id<"users"> })
                           }
                        >
                           Approve
                        </DropdownMenuItem>
                     )}

                     {/* Delete for pending users */}
                     {user.status === "pending" && (
                        <DropdownMenuItem
                           onClick={() => {
                              setSelectedUser(user);
                              setOpenDelete(true);
                           }}
                           className="text-red-600 focus:text-red-600"
                        >
                           Delete Request
                        </DropdownMenuItem>
                     )}

                     <DropdownMenuItem
                        onClick={() => {
                           setSelectedUser(user);
                           setOpenEdit(true);
                        }}
                     >
                        Edit Account
                     </DropdownMenuItem>

                     {user.status === "approved" && (
                        <DropdownMenuItem
                           onClick={() => {
                              setSelectedUser(user);
                              setOpenDelete(true);
                           }}
                           className="text-red-600 focus:text-red-600"
                        >
                           Delete Account
                        </DropdownMenuItem>
                     )}
                  </DropdownMenuContent>
               </DropdownMenu>
            );
         },
      },
   ];
   // ⬆⬆⬆ END COLUMNS ⬆⬆⬆

   return (
      <div className="w-full p-6">
         {/* Edit Dialog */}
         <Dialog open={openEdit} onOpenChange={setOpenEdit}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Edit Account</DialogTitle>
                  <DialogDescription>
                     Modify user information and click save when you're done.
                  </DialogDescription>
               </DialogHeader>

               {selectedUser && (
                  <div className="space-y-4 py-2">
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="text-sm font-medium">
                              First Name
                           </label>
                           <Input
                              value={selectedUser.firstname}
                              onChange={(e) =>
                                 setSelectedUser({
                                    ...selectedUser,
                                    firstname: e.target.value,
                                 })
                              }
                           />
                        </div>

                        <div>
                           <label className="text-sm font-medium">
                              Last Name
                           </label>
                           <Input
                              value={selectedUser.lastname}
                              onChange={(e) =>
                                 setSelectedUser({
                                    ...selectedUser,
                                    lastname: e.target.value,
                                 })
                              }
                           />
                        </div>
                     </div>

                     <div>
                        <label className="text-sm font-medium">
                           Contact Number
                        </label>
                        <Input
                           value={selectedUser.contactNumber}
                           onChange={(e) =>
                              setSelectedUser({
                                 ...selectedUser,
                                 contactNumber: e.target.value,
                              })
                           }
                        />
                     </div>

                     <div>
                        <label className="text-sm font-medium">Address</label>
                        <Input
                           value={selectedUser.address}
                           onChange={(e) =>
                              setSelectedUser({
                                 ...selectedUser,
                                 address: e.target.value,
                              })
                           }
                        />
                     </div>

                     <div>
                        <label className="text-sm font-medium">Role</label>
                        <div>
                           <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                 <Button
                                    variant="outline"
                                    className="w-full justify-start"
                                 >
                                    {selectedUser.role}
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                 </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                 <DropdownMenuItem
                                    onClick={() =>
                                       setSelectedUser({
                                          ...selectedUser,
                                          role: "Resident",
                                       })
                                    }
                                 >
                                    Resident
                                 </DropdownMenuItem>
                                 <DropdownMenuItem
                                    onClick={() =>
                                       setSelectedUser({
                                          ...selectedUser,
                                          role: "Responder",
                                       })
                                    }
                                 >
                                    Responder
                                 </DropdownMenuItem>
                              </DropdownMenuContent>
                           </DropdownMenu>
                        </div>
                     </div>
                  </div>
               )}

               <DialogFooter className="flex justify-between">
                  <div className="space-x-2">
                     <Button
                        variant="outline"
                        onClick={() => setOpenEdit(false)}
                     >
                        Cancel
                     </Button>
                     <Button
                        onClick={() => {
                           if (!selectedUser) return;

                           updateUser({
                              userId: selectedUser._id as Id<"users">,
                              firstname: selectedUser.firstname,
                              lastname: selectedUser.lastname,
                              contactNumber: selectedUser.contactNumber,
                              address: selectedUser.address,
                              role: selectedUser.role,
                           });

                           setOpenEdit(false);
                        }}
                     >
                        Save Changes
                     </Button>
                  </div>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         {/* Delete Confirmation Dialog */}
         <Dialog open={openDelete} onOpenChange={setOpenDelete}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle className="text-destructive font-poppinsBold font-normal">
                     Delete Account
                  </DialogTitle>
                  <DialogDescription className="space-y-2">
                     <p className="font-poppins font-normal">
                        This action cannot be undone. All user data will be
                        permanently removed.
                     </p>
                     <p className="text-destructive font-poppins">
                        This will permanently delete{" "}
                        <strong>
                           {selectedUser?.firstname} {selectedUser?.lastname}'s
                        </strong>{" "}
                        account.
                     </p>
                  </DialogDescription>
               </DialogHeader>

               <DialogFooter>
                  <Button
                     variant="outline"
                     onClick={() => setOpenDelete(false)}
                     disabled={isDeleting}
                  >
                     Cancel
                  </Button>
                  <Button
                     variant="destructive"
                     onClick={handleDeleteUser}
                     disabled={isDeleting}
                  >
                     {isDeleting ? "Deleting..." : "Delete Account Permanently"}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>

         <Tabs defaultValue="approved">
            <TabsList>
               <TabsTrigger value="approved">Approved Users</TabsTrigger>
               <TabsTrigger value="pending">Requests</TabsTrigger>
            </TabsList>

            <TabsContent value="approved">
               <DataTable data={approvedUsers} columns={columns} />
            </TabsContent>

            <TabsContent value="pending">
               <DataTable data={pendingUsers} columns={columns} />
            </TabsContent>
         </Tabs>
      </div>
   );
}
