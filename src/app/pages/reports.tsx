import {
   AlertsStats,
   AlertTable,
   AlertTabs,
   ChartCategory,
   ChartDate,
   ChartLevel,
   ExportExcel,
   ExportPDF,
} from "@/components/chart-category";
import { Button } from "@/components/ui/button";
import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function Reports() {
   const [filter, setFilter] = useState<"all" | "dateRange">("dateRange");
   const [options, setOptions] = useState<{ startDate?: Date; endDate?: Date }>(
      () => {
         const end = new Date();
         const start = new Date();
         start.setDate(start.getDate() - 7);
         return { startDate: start, endDate: end };
      }
   );

   return (
      <div className="flex flex-col p-4 gap-4">
         <div className="flex flex-row justify-between items-center">
            <div className="w-full flex-1">
               <AlertTabs
                  onChange={(
                     selected: "all" | "dateRange",
                     opts?: { startDate?: Date; endDate?: Date }
                  ) => {
                     setFilter(selected);
                     setOptions(opts || {});
                  }}
               />
            </div>

            <DropdownMenu>
               <DropdownMenuTrigger>
                  <Button>Export</Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent className="p-0">
                  <DropdownMenuItem>
                     <ExportExcel filter={filter} options={options} />
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                     <ExportPDF filter={filter} options={options} />
                  </DropdownMenuItem>
               </DropdownMenuContent>
            </DropdownMenu>
         </div>
         <AlertsStats filter={filter} options={options} />
         <div className="lg:flex flex-row gap-4">
            <div className="flex-1">
               <ChartDate filter={filter} options={options} />
            </div>
            <div className="lg:w-96">
               <ChartCategory filter={filter} options={options} />
            </div>
            <div className="lg:w-80">
               <ChartLevel filter={filter} options={options} />
            </div>
         </div>
         <AlertTable filter={filter} options={options} />
      </div>
   );
}
