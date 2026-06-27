"use client";

import { useState, useEffect } from "react";
import { isWithinInterval } from "date-fns";
import {
   Area,
   AreaChart,
   Bar,
   BarChart,
   CartesianGrid,
   Cell,
   Legend,
   Pie,
   PieChart,
   XAxis,
   YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
   ChartConfig,
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Skeleton } from "./ui/skeleton";
import AlertsTable from "./alerts-table";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface Alert {
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
   [key: string]: unknown;
}

type FilterOption = "all" | "dateRange";

interface FilterOptions {
   startDate?: Date;
   endDate?: Date;
   category?: string;
   alertLevel?: string;
   location?: string;
}

interface ChartProps {
   filter?: FilterOption;
   options?: FilterOptions;
}

interface AlertTabsProps {
   onChange?: (filter: FilterOption, options?: FilterOptions) => void;
}

export function AlertTabs({ onChange }: AlertTabsProps) {
   const [startDate, setStartDate] = useState<string>("");
   const [endDate, setEndDate] = useState<string>("");
   const [category, setCategory] = useState<string>("all");
   const [alertLevel, setAlertLevel] = useState<string>("all");
   const [location, setLocation] = useState<string>("all");
   const [isInitialized, setIsInitialized] = useState(false);

   useEffect(() => {
      if (!isInitialized) {
         const end = new Date();
         const start = new Date();
         start.setDate(start.getDate() - 7);

         const startString = start.toISOString().split("T")[0];
         const endString = end.toISOString().split("T")[0];

         setStartDate(startString);
         setEndDate(endString);
         setIsInitialized(true);

         onChange?.("dateRange", {
            startDate: start,
            endDate: end,
         });
      }
   }, [onChange, isInitialized]);

   const handleDateChange = (type: "start" | "end", value: string) => {
      if (type === "start") setStartDate(value);
      else setEndDate(value);

      const s = type === "start" ? value : startDate;
      const e = type === "end" ? value : endDate;

      if (s && e) {
         onChange?.("dateRange", {
            startDate: new Date(s),
            endDate: new Date(e),
            category: category !== "all" ? category : undefined,
            alertLevel: alertLevel !== "all" ? alertLevel : undefined,
            location: location !== "all" ? location : undefined,
         });
      } else {
         onChange?.("all", {
            category: category !== "all" ? category : undefined,
            alertLevel: alertLevel !== "all" ? alertLevel : undefined,
            location: location !== "all" ? location : undefined,
         });
      }
   };

   const handleFilterChange = (
      type: "category" | "alertLevel" | "location",
      value: string
   ) => {
      switch (type) {
         case "category":
            setCategory(value);
            break;
         case "alertLevel":
            setAlertLevel(value);
            break;
         case "location":
            setLocation(value);
            break;
      }

      const filterOptions: FilterOptions = {
         category: category !== "all" ? category : undefined,
         alertLevel: alertLevel !== "all" ? alertLevel : undefined,
         location: location !== "all" ? location : undefined,
      };

      if (type === "category") {
         filterOptions.category = value !== "all" ? value : undefined;
      } else if (type === "alertLevel") {
         filterOptions.alertLevel = value !== "all" ? value : undefined;
      } else if (type === "location") {
         filterOptions.location = value !== "all" ? value : undefined;
      }

      if (startDate && endDate) {
         onChange?.("dateRange", {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            ...filterOptions,
         });
      } else {
         onChange?.("all", filterOptions);
      }
   };
   const handleReset = () => {
      setStartDate("");
      setEndDate("");
      setCategory("all");
      setAlertLevel("all");
      setLocation("all");
      onChange?.("all");
   };

   const blockOptions = [
      "Block 1",
      "Block 2",
      "Block 3",
      "Block 4",
      "Block 5",
      "Block 6",
   ];

   return (
      <div className="space-y-4">
         <div className="flex gap-3 items-center flex-wrap">
            <div className="flex gap-2 items-center mr-3">
               <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleDateChange("start", e.target.value)}
                  className="w-48"
               />
               <span className="text-gray-500">to</span>
               <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => handleDateChange("end", e.target.value)}
                  min={startDate || undefined}
                  className="w-48"
               />
            </div>

            <Select
               value={category}
               onValueChange={(value) => handleFilterChange("category", value)}
            >
               <SelectTrigger className="w-48">
                  <SelectValue placeholder="Category" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.keys(CATEGORY_MAP).map((cat) => (
                     <SelectItem key={cat} value={cat}>
                        {cat}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>

            <Select
               value={alertLevel}
               onValueChange={(value) =>
                  handleFilterChange("alertLevel", value)
               }
            >
               <SelectTrigger className="w-35">
                  <SelectValue placeholder="Alert Level" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {Object.keys(LEVEL_MAP).map((level) => (
                     <SelectItem key={level} value={level}>
                        {level}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>

            <Select
               value={location}
               onValueChange={(value) => handleFilterChange("location", value)}
            >
               <SelectTrigger className="w-35">
                  <SelectValue placeholder="Location" />
               </SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {blockOptions.map((block) => (
                     <SelectItem key={block} value={block}>
                        {block}
                     </SelectItem>
                  ))}
               </SelectContent>
            </Select>

            <Button
               onClick={handleReset}
               variant="secondary"
               disabled={
                  !startDate &&
                  !endDate &&
                  category === "all" &&
                  alertLevel === "all" &&
                  location === "all"
               }
            >
               Clear Filters
            </Button>
         </div>
      </div>
   );
}

export function filterAlertsByTab(
   alerts: Alert[],
   tab: FilterOption,
   options?: FilterOptions
) {
   return alerts.filter((alert) => {
      const rawTime = alert._creationTime;
      const date = new Date(rawTime as any);

      let dateMatch = true;
      if (tab === "dateRange" && options?.startDate && options?.endDate) {
         dateMatch = isWithinInterval(date, {
            start: options.startDate,
            end: options.endDate,
         });
      }

      const categoryMatch =
         !options?.category ||
         options.category === "all" ||
         alert.category === options.category;

      const alertLevelMatch =
         !options?.alertLevel ||
         options.alertLevel === "all" ||
         alert.alertLevel === options.alertLevel;

      const locationMatch =
         !options?.location ||
         options.location === "all" ||
         (alert.location &&
            alert.location
               .toLowerCase()
               .includes(options.location.toLowerCase()));

      return dateMatch && categoryMatch && alertLevelMatch && locationMatch;
   });
}

const CATEGORY_MAP_NAME: Record<string, string> = {
   "Health Emergency": "Health",
   "Fire Emergency": "Fire",
   "Flood or Weather Disaster": "Flood",
   "Crime or Security Threat": "Crime",
};

const CATEGORY_MAP = {
   "Health Emergency": { key: "health", label: "Health", color: "#ff4545" },
   "Fire Emergency": { key: "fire", label: "Fire", color: "#fb8c0e" },
   "Flood or Weather Disaster": {
      key: "flood",
      label: "Flood",
      color: "#0e79fb",
   },
   "Crime or Security Threat": {
      key: "crime",
      label: "Crime",
      color: "#353c51",
   },
} as const;

const LEVEL_MAP = {
   "Non-Urgent": { key: "nonUrgent", label: "Non-Urgent", color: "#4caf50" },
   Urgent: { key: "urgent", label: "Urgent", color: "#FFE100" },
   Immediate: { key: "immediate", label: "Immediate", color: "#f44336" },
} as const;

function getDefaultDateRange() {
   const end = new Date();
   const start = new Date();
   start.setDate(start.getDate() - 7);
   return { startDate: start, endDate: end };
}

function exportToPDF(alerts: Alert[], filterOptions?: FilterOptions) {
   try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;

      const headerImageUrl = "/header.png";

      const img = new Image();
      img.src = headerImageUrl;

      const headerHeight = 30;
      const headerWidth = (img.width / img.height) * headerHeight;
      const headerX = (pageWidth - headerWidth) / 2; 

      doc.addImage(
         headerImageUrl,
         "PNG",
         headerX,
         0,
         headerWidth,
         headerHeight
      );

      doc.setFontSize(20);
      doc.text("Alerts Report", pageWidth / 2, 40, { align: "center" });

      const startY = 48;
      doc.setFontSize(10);
      let filterText = "All Alerts";

      if (filterOptions) {
         const filterParts = [];
         if (filterOptions.startDate && filterOptions.endDate) {
            filterParts.push(
               `Date: ${filterOptions.startDate.toLocaleDateString()} - ${filterOptions.endDate.toLocaleDateString()}`
            );
         }
         if (filterOptions.category && filterOptions.category !== "all") {
            filterParts.push(`Category: ${filterOptions.category}`);
         }
         if (filterOptions.alertLevel && filterOptions.alertLevel !== "all") {
            filterParts.push(`Alert Level: ${filterOptions.alertLevel}`);
         }
         if (filterOptions.location && filterOptions.location !== "all") {
            filterParts.push(`Location: ${filterOptions.location}`);
         }

         if (filterParts.length > 0) {
            filterText = filterParts.join(" | ");
         }
      }

      doc.text(`${filterText}`, 14, startY);
      doc.text(`Exported: ${new Date().toLocaleString()}`, 14, startY + 6);
      doc.text(`Total Alerts: ${alerts.length}`, 14, startY + 12);

      const tableData = alerts.map((alert) => [
         alert.category || "N/A",
         alert.relatedCategory || "N/A",
         alert.alertLevel || "N/A",
         alert.location || "N/A",
         alert.userName || "N/A",
         alert.status || "N/A",
         alert.description
            ? alert.description.substring(0, 50) +
              (alert.description.length > 50 ? "..." : "")
            : "N/A",
         alert.responder?.join(", ") || "N/A",
         alert._creationTime
            ? new Date(alert._creationTime).toLocaleDateString()
            : "N/A",
         alert.resolvedTime
            ? new Date(alert.resolvedTime).toLocaleDateString()
            : "N/A",
      ]);

      autoTable(doc, {
         startY: startY + 20,
         head: [
            [
               "Category",
               "Related Category",
               "Alert Level",
               "Location",
               "Reported By",
               "Status",
               "Description",
               "Responder",
               "Date Reported",
               "Date Resolved",
            ],
         ],
         body: tableData,
         styles: { fontSize: 8 },
         headStyles: { fillColor: [63, 113, 20] },
      });

      const finalY = (doc as any).lastAutoTable.finalY || startY + 100;

      const preparedByY = finalY + 10;
      const signatureLineY = preparedByY + 8;

      doc.setFontSize(10);
      doc.text("Prepared by:", 14, preparedByY);

      doc.line(14, signatureLineY, 80, signatureLineY);

      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      doc.text("Signature over Printed Name", 29, signatureLineY + 4);

      doc.save(`alerts_report_${new Date().toISOString().split("T")[0]}.pdf`);
   } catch (error) {
      console.error("Error in PDF generation:", error);
      throw error; 
   }
}

export function AlertsStats({ filter = "dateRange", options }: ChartProps) {
   const rawAlerts = (useQuery(api.getLiveAlerts.getLiveAlerts) ??
      []) as Alert[];

   const effectiveOptions = options || getDefaultDateRange();
   const effectiveFilter =
      filter === "dateRange" &&
      effectiveOptions.startDate &&
      effectiveOptions.endDate
         ? "dateRange"
         : "all";

   const filteredAlerts = filterAlertsByTab(
      rawAlerts,
      effectiveFilter,
      effectiveOptions
   ).filter((a) => a.status === "Resolved" || a.status === "Active");

   const totalAlerts = filteredAlerts.length;

   const categoryCount = filteredAlerts.reduce<Record<string, number>>(
      (acc, alert) => {
         const mapped = alert.category
            ? (CATEGORY_MAP_NAME[alert.category] ?? alert.category)
            : "Unknown";
         acc[mapped] = (acc[mapped] || 0) + 1;
         return acc;
      },
      {}
   );

   const mostFrequentCategory =
      Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] ??
      "N/A";

   return (
      <div className="flex flex-row gap-4">
         <Card>
            <CardContent>
               <p className="font-poppins">Total Alerts</p>
               <p className="text-6xl font-poppinsBold">{totalAlerts}</p>
            </CardContent>
         </Card>
         <Card>
            <CardContent>
               <p className="font-poppins">Most Frequent Alert Category</p>
               <p className="text-6xl font-poppinsBold">
                  {mostFrequentCategory}
               </p>
            </CardContent>
         </Card>
      </div>
   );
}

export function ChartCategory({ filter = "dateRange", options }: ChartProps) {
   const rawAlerts = (useQuery(api.getLiveAlerts.getLiveAlerts) ??
      []) as Alert[];

   const effectiveOptions = options || getDefaultDateRange();
   const effectiveFilter =
      filter === "dateRange" &&
      effectiveOptions.startDate &&
      effectiveOptions.endDate
         ? "dateRange"
         : "all";

   const filteredAlerts = filterAlertsByTab(
      rawAlerts,
      effectiveFilter,
      effectiveOptions
   ).filter((a) => a.status === "Resolved" || a.status === "Active");

   if (!rawAlerts) return <Skeleton className="flex-1 w-full h-full" />;

   const totals = filteredAlerts.reduce(
      (
         acc: { crime: number; flood: number; fire: number; health: number },
         alert
      ) => {
         const map = alert.category
            ? (CATEGORY_MAP[alert.category as keyof typeof CATEGORY_MAP] ??
              null)
            : null;
         if (map) acc[map.key as keyof typeof acc] += 1;
         return acc;
      },
      { crime: 0, flood: 0, fire: 0, health: 0 }
   );

   const data = Object.values(CATEGORY_MAP).map(({ label, color, key }) => ({
      category: label,
      count: totals[key as keyof typeof totals],
      fill: color,
   }));

   const chartConfig: ChartConfig = Object.fromEntries(
      Object.values(CATEGORY_MAP).map((item) => [
         item.key,
         { label: item.label, color: item.color },
      ])
   ) as ChartConfig;

   return (
      <Card>
         <CardHeader>
            <CardTitle className="font-poppinsBold font-normal text-lg">
               Alerts by Category
            </CardTitle>
         </CardHeader>
         <CardContent>
            <ChartContainer
               config={chartConfig}
               className="h-[200px] -ml-6 w-full"
            >
               <BarChart data={data}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                     dataKey="category"
                     tickLine={false}
                     tickMargin={8}
                     minTickGap={32}
                  />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip
                     cursor={false}
                     content={
                        <ChartTooltipContent
                           labelFormatter={(value) => value as string}
                           indicator="dot"
                        />
                     }
                  />
                  <Bar dataKey="count">
                     {data.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                     ))}
                  </Bar>
               </BarChart>
            </ChartContainer>
         </CardContent>
      </Card>
   );
}

export function ChartLevel({ filter = "dateRange", options }: ChartProps) {
   const rawAlerts = (useQuery(api.getLiveAlerts.getLiveAlerts) ??
      []) as Alert[];

   const effectiveOptions = options || getDefaultDateRange();
   const effectiveFilter =
      filter === "dateRange" &&
      effectiveOptions.startDate &&
      effectiveOptions.endDate
         ? "dateRange"
         : "all";

   const filteredAlerts = filterAlertsByTab(
      rawAlerts,
      effectiveFilter,
      effectiveOptions
   ).filter((a) => a.status === "Resolved" || a.status === "Active");

   if (!rawAlerts) return <Skeleton className="flex-1 w-full h-full" />;

   const totals = filteredAlerts.reduce(
      (
         acc: { nonUrgent: number; urgent: number; immediate: number },
         alert
      ) => {
         const map = alert.alertLevel
            ? (LEVEL_MAP[alert.alertLevel as keyof typeof LEVEL_MAP] ?? null)
            : null;
         if (map) acc[map.key as keyof typeof acc] += 1;
         return acc;
      },
      { nonUrgent: 0, urgent: 0, immediate: 0 }
   );

   const data = Object.values(LEVEL_MAP).map(({ label, color, key }) => ({
      level: label,
      count: totals[key as keyof typeof totals],
      fill: color,
   }));

   const chartConfig: ChartConfig = Object.fromEntries(
      Object.values(LEVEL_MAP).map((item) => [
         item.key,
         { label: item.label, color: item.color },
      ])
   ) as ChartConfig;

   return (
      <Card>
         <CardHeader>
            <CardTitle className="font-poppinsBold font-normal text-lg">
               Alert Level Distribution
            </CardTitle>
         </CardHeader>
         <CardContent>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
               <PieChart>
                  <ChartTooltip
                     cursor={false}
                     content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie data={data} dataKey="count" nameKey="level" />
                  <Legend
                     payload={data.map((item) => ({
                        value: (
                           <span className="text-gray-500">{item.level}</span>
                        ),
                        type: "circle",
                        color: item.fill,
                     }))}
                  />
               </PieChart>
            </ChartContainer>
         </CardContent>
      </Card>
   );
}

export function ChartDate({ filter = "dateRange", options }: ChartProps) {
   const rawAlerts = (useQuery(api.getLiveAlerts.getLiveAlerts) ??
      []) as Alert[];

   const effectiveOptions = options || getDefaultDateRange();
   const effectiveFilter =
      filter === "dateRange" &&
      effectiveOptions.startDate &&
      effectiveOptions.endDate
         ? "dateRange"
         : "all";

   const filteredAlerts = filterAlertsByTab(
      rawAlerts,
      effectiveFilter,
      effectiveOptions
   ).filter((a) => a.status === "Resolved" || a.status === "Active");

   if (!rawAlerts) return <Skeleton className="flex-1 w-full h-full" />;

   const allDates = Array.from(
      new Set(
         filteredAlerts.map(
            (a) => new Date(a._creationTime as any).toISOString().split("T")[0]
         )
      )
   ).sort();

   const statsByDate: Record<
      string,
      { crime: number; fire: number; flood: number; health: number }
   > = {};

   filteredAlerts.forEach((alert) => {
      const dateKey = new Date(alert._creationTime as any)
         .toISOString()
         .split("T")[0];
      if (!statsByDate[dateKey])
         statsByDate[dateKey] = { crime: 0, fire: 0, flood: 0, health: 0 };

      if (alert.category === "Crime or Security Threat")
         statsByDate[dateKey].crime++;
      else if (alert.category === "Fire Emergency") statsByDate[dateKey].fire++;
      else if (alert.category === "Flood or Weather Disaster")
         statsByDate[dateKey].flood++;
      else if (alert.category === "Health Emergency")
         statsByDate[dateKey].health++;
   });

   const mergedData = allDates.map((date) => ({
      date,
      health: statsByDate[date]?.health ?? 0,
      fire: statsByDate[date]?.fire ?? 0,
      flood: statsByDate[date]?.flood ?? 0,
      crime: statsByDate[date]?.crime ?? 0,
   }));

   const chartConfig = {
      health: { label: "health", color: "hsl(var(--chart-1))" },
      fire: { label: "fire", color: "hsl(var(--chart-2))" },
      flood: { label: "flood", color: "hsl(var(--chart-1))" },
      crime: { label: "crime", color: "hsl(var(--chart-2))" },
   } satisfies ChartConfig;

   return (
      <Card>
         <CardHeader>
            <CardTitle className="font-poppinsBold font-normal text-lg">
               Alerts Over Time
            </CardTitle>
         </CardHeader>
         <CardContent>
            <ChartContainer
               config={chartConfig}
               className="h-[200px] -ml-6 w-full"
            >
               <AreaChart data={mergedData}>
                  <defs>
                     <linearGradient
                        id="fillHealth"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                     >
                        <stop
                           offset="5%"
                           stopColor="#ff4545"
                           stopOpacity={0.5}
                        />
                        <stop
                           offset="95%"
                           stopColor="#ff4545"
                           stopOpacity={0.1}
                        />
                     </linearGradient>
                     <linearGradient id="fillFire" x1="0" y1="0" x2="0" y2="1">
                        <stop
                           offset="5%"
                           stopColor="#fb8c0e"
                           stopOpacity={0.5}
                        />
                        <stop
                           offset="95%"
                           stopColor="#fb8c0e"
                           stopOpacity={0.1}
                        />
                     </linearGradient>
                     <linearGradient id="fillFlood" x1="0" y1="0" x2="0" y2="1">
                        <stop
                           offset="5%"
                           stopColor="#0e79fb"
                           stopOpacity={0.5}
                        />
                        <stop
                           offset="95%"
                           stopColor="#0e79fb"
                           stopOpacity={0.1}
                        />
                     </linearGradient>
                     <linearGradient id="fillCrime" x1="0" y1="0" x2="0" y2="1">
                        <stop
                           offset="5%"
                           stopColor="#353c51"
                           stopOpacity={0.5}
                        />
                        <stop
                           offset="95%"
                           stopColor="#353c51"
                           stopOpacity={0.1}
                        />
                     </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <YAxis allowDecimals={false} />
                  <XAxis
                     dataKey="date"
                     tickLine={false}
                     axisLine={false}
                     tickMargin={8}
                     minTickGap={32}
                     interval="preserveStartEnd"
                     tickFormatter={(value) =>
                        new Date(value as string).toLocaleDateString("en-US", {
                           month: "short",
                           day: "numeric",
                        })
                     }
                  />
                  <ChartTooltip
                     cursor={false}
                     content={
                        <ChartTooltipContent
                           labelFormatter={(value) =>
                              new Date(value as string).toLocaleDateString(
                                 "en-US",
                                 { month: "short", day: "numeric" }
                              )
                           }
                           indicator="dot"
                        />
                     }
                  />
                  <Area
                     dataKey="health"
                     type="monotone"
                     fill="url(#fillHealth)"
                     stroke="#ff4545"
                  />
                  <Area
                     dataKey="fire"
                     type="monotone"
                     fill="url(#fillFire)"
                     stroke="#fb8c0e"
                  />
                  <Area
                     dataKey="flood"
                     type="monotone"
                     fill="url(#fillFlood)"
                     stroke="#0e79fb"
                  />
                  <Area
                     dataKey="crime"
                     type="monotone"
                     fill="url(#fillCrime)"
                     stroke="#353c51"
                  />
               </AreaChart>
            </ChartContainer>
         </CardContent>
      </Card>
   );
}

export function AlertTable({ filter = "dateRange", options }: ChartProps) {
   const rawAlerts = (useQuery(api.getLiveAlerts.getLiveAlerts) ??
      []) as Alert[];

   const effectiveOptions = options || getDefaultDateRange();
   const effectiveFilter =
      filter === "dateRange" &&
      effectiveOptions.startDate &&
      effectiveOptions.endDate
         ? "dateRange"
         : "all";

   const filteredAlerts = filterAlertsByTab(
      rawAlerts,
      effectiveFilter,
      effectiveOptions
   ).filter((a) => a.status === "Resolved" || a.status === "Active");

   if (!rawAlerts) return <Skeleton className="flex-1 w-full h-full" />;

   return (
      <div>
         <AlertsTable data={filteredAlerts} />
      </div>
   );
}

export function ExportExcel({ filter = "dateRange", options }: ChartProps) {
   const rawAlerts = (useQuery(api.getLiveAlerts.getLiveAlerts) ??
      []) as Alert[];

   if (!rawAlerts) return <Skeleton className="flex-1 w-full h-full" />;

   const exportToExcel = () => {
      const effectiveOptions = options || getDefaultDateRange();
      const effectiveFilter =
         filter === "dateRange" &&
         effectiveOptions.startDate &&
         effectiveOptions.endDate
            ? "dateRange"
            : "all";

      const filteredAlerts = filterAlertsByTab(
         rawAlerts,
         effectiveFilter,
         effectiveOptions
      ).filter((a) => a.status === "Resolved" || a.status === "Active");

      const exportData = filteredAlerts.map((alert) => ({
         Category: alert.category,
         "Related Category": alert.relatedCategory || "",
         "Alert Level": alert.alertLevel,
         Location: alert.location,
         "Reported By": alert.userName,
         Status: alert.status,
         Description: alert.description,
         Responder: alert.responder?.join(", ") || "",
         "Date Reported": new Date(alert._creationTime).toLocaleString(),
         "Date Resolved": alert.resolvedTime
            ? new Date(alert.resolvedTime).toLocaleString()
            : "",
      }));

      const filterParts = [];

      if (
         effectiveFilter === "dateRange" &&
         effectiveOptions?.startDate &&
         effectiveOptions?.endDate
      ) {
         filterParts.push(
            `Date Range: ${effectiveOptions.startDate.toLocaleDateString()} - ${effectiveOptions.endDate.toLocaleDateString()}`
         );
      } else if (effectiveFilter === "all") {
         filterParts.push("All Dates");
      }

      const filterOptions = effectiveOptions as FilterOptions;

      if (filterOptions?.category && filterOptions.category !== "all") {
         filterParts.push(`Category: ${filterOptions.category}`);
      }

      if (filterOptions?.alertLevel && filterOptions.alertLevel !== "all") {
         filterParts.push(`Alert Level: ${filterOptions.alertLevel}`);
      }

      if (filterOptions?.location && filterOptions.location !== "all") {
         filterParts.push(`Location: ${filterOptions.location}`);
      }

      const filterLabel =
         filterParts.length > 0 ? filterParts.join(" | ") : "All Alerts";

      const ws = XLSX.utils.aoa_to_sheet([]);

      XLSX.utils.sheet_add_aoa(ws, [[filterLabel]], { origin: "A1" });
      XLSX.utils.sheet_add_aoa(
         ws,
         [["Exported:", new Date().toLocaleString()]],
         {
            origin: "A2",
         }
      );
      XLSX.utils.sheet_add_aoa(ws, [["Total Alerts:", filteredAlerts.length]], {
         origin: "A3",
      });

      XLSX.utils.sheet_add_aoa(ws, [[""]], { origin: "A4" });

      if (exportData.length > 0) {
         XLSX.utils.sheet_add_json(ws, exportData, {
            origin: "A5",
            skipHeader: false,
         });
      } else {
         XLSX.utils.sheet_add_aoa(
            ws,
            [["No alerts found for selected filter"]],
            {
               origin: "A5",
            }
         );
      }

      const headerRow = exportData[0]
         ? Object.keys(exportData[0])
         : ["Message"];
      ws["!cols"] = headerRow.map(() => ({ wch: 20 }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Alerts");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], {
         type: "application/octet-stream",
      });
      saveAs(data, `alerts_${new Date().toISOString().split("T")[0]}.xlsx`);
   };

   return (
      <Button onClick={exportToExcel} variant="ghost">
         Export to Excel
      </Button>
   );
}

export function ExportPDF({ filter = "dateRange", options }: ChartProps) {
   const rawAlerts = (useQuery(api.getLiveAlerts.getLiveAlerts) ??
      []) as Alert[];

   if (!rawAlerts) return <Skeleton className="flex-1 w-full h-full" />;

   const handleExportPDF = () => {
      const effectiveOptions = options || getDefaultDateRange();
      const effectiveFilter =
         filter === "dateRange" &&
         effectiveOptions.startDate &&
         effectiveOptions.endDate
            ? "dateRange"
            : "all";

      const filteredAlerts = filterAlertsByTab(
         rawAlerts,
         effectiveFilter,
         effectiveOptions
      ).filter((a) => a.status === "Resolved" || a.status === "Active");

      exportToPDF(filteredAlerts, effectiveOptions);
   };

   return (
      <Button onClick={handleExportPDF} variant="ghost">
         Export to PDF
      </Button>
   );
}

export function ExportButtons({ filter = "dateRange", options }: ChartProps) {
   return (
      <div>
         <ExportExcel filter={filter} options={options} />
         <ExportPDF filter={filter} options={options} />
      </div>
   );
}
