"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
   Card,
   CardContent,
   CardHeader,
   CardTitle,
} from "@/components/ui/card";
import {
   ChartConfig,
   ChartContainer,
   ChartTooltip,
   ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Skeleton } from "./ui/skeleton";

export function ChartArea() {
   const today = new Date();
   const startDate = new Date();
   startDate.setDate(today.getDate() - 30);

   const allDates = [];
   for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      allDates.push(new Date(d).toISOString().split("T")[0]);
   }

   const rawAlerts = useQuery(api.getLiveAlerts.getLiveAlerts);
   const alerts =
      rawAlerts?.filter((a) => a.status === "Resolved" || a.status === "Active") ?? [];
   
   if (!rawAlerts) {
      return <Skeleton className="flex-1 w-full h-full" />;
   }

   const statsByDate: Record<
      string,
      { crime: number; fire: number; flood: number; health: number }
   > = {};
   
   alerts.forEach((alert) => {
      const date = new Date(alert._creationTime).toISOString().split("T")[0];
      if (!statsByDate[date]) {
         statsByDate[date] = { crime: 0, fire: 0, flood: 0, health: 0 };
      }
   
      if (alert.category === "Crime or Security Threat") statsByDate[date].crime++;
      else if (alert.category === "Fire Emergency") statsByDate[date].fire++;
      else if (alert.category === "Flood or Weather Disaster") statsByDate[date].flood++;
      else if (alert.category === "Health Emergency") statsByDate[date].health++;
   });

   const mergedData = allDates.map((date) => ({
      date,
      crime: statsByDate[date]?.crime ?? 0,
      fire: statsByDate[date]?.fire ?? 0,
      flood: statsByDate[date]?.flood ?? 0,
      health: statsByDate[date]?.health ?? 0,
   }));
   

   const chartConfig = {
      health: {
         label: "health",
         color: "hsl(var(--chart-1))",
      },
      fire: {
         label: "fire",
         color: "hsl(var(--chart-2))",
      },
      flood: {
         label: "flood",
         color: "hsl(var(--chart-1))",
      },
      crime: {
         label: "crime",
         color: "hsl(var(--chart-2))",
      },
   } satisfies ChartConfig;

   return (
      <Card>
         <CardHeader>
            <CardTitle className="font-poppinsBold font-normal text-lg">
               Alerts this month
            </CardTitle>
         </CardHeader>
         <CardContent>
            <ChartContainer
               config={chartConfig}
               className="h-[230px] w-full"
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
                           stopOpacity={1.0}
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
                           stopOpacity={0.8}
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
                           stopOpacity={1.0}
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
                           stopOpacity={1.0}
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
                     tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", {
                           month: "short",
                           day: "numeric",
                        });
                     }}
                  />
                  <ChartTooltip
                     cursor={false}
                     content={
                        <ChartTooltipContent
                           labelFormatter={(value) => {
                              return new Date(value).toLocaleDateString(
                                 "en-US",
                                 {
                                    month: "short",
                                    day: "numeric",
                                 }
                              );
                           }}
                           indicator="dot"
                        />
                     }
                  />

                  <Area
                     dataKey="crime"
                     type="monotone"
                     fill="url(#fillCrime)"
                     stroke="#353c51"
                  />
                  <Area
                     dataKey="flood"
                     type="monotone"
                     fill="url(#fillFlood)"
                     stroke="#0e79fb"
                  />
                  <Area
                     dataKey="fire"
                     type="monotone"
                     fill="url(#fillFire)"
                     stroke="#fb8c0e"
                  />
                  <Area
                     dataKey="health"
                     type="monotone"
                     fill="url(#fillHealth)"
                     stroke="#ff4545"
                  />
               </AreaChart>
            </ChartContainer>
         </CardContent>
      </Card>
   );
}
