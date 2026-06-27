import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Skeleton } from "./ui/skeleton";
import { SheetStore } from "./store/sheet-store";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

const categoryToIcon: any = {
   "Health Emergency": "/health.png",
   "Crime or Security Threat": "/crime.png",
   "Fire Emergency": "/fire.png",
   "Flood or Weather Disaster": "/flood.png",
};

function timeAgo(timestamp: number) {
   const now = Date.now();
   const diff = Math.floor((now - timestamp) / 1000); // seconds

   if (diff < 60) return `${diff} second${diff !== 1 ? "s" : ""} ago`;
   if (diff < 3600)
      return `${Math.floor(diff / 60)} minute${diff < 120 ? "" : "s"} ago`;
   if (diff < 86400)
      return `${Math.floor(diff / 3600)} hour${diff < 7200 ? "" : "s"} ago`;

   return `${Math.floor(diff / 86400)} day${diff < 172800 ? "" : "s"} ago`;
}

export function AlertCard() {
   const [filter, setFilter] = useState("recent");
   const { openSheet } = SheetStore();
   const alerts = useQuery(api.getLiveAlerts.getLiveAlerts);
   if (!alerts) return <Skeleton className="flex-1 w-full h-full" />;

   return (
      <Card className="lg:h-dvh overflow-hidden px-1 mb-4 lg:mb-0">
         <CardHeader className="flex items-center justify-between -mb-4">
            <p className="font-poppinsBold text-lg">
               Live Alert (
               {alerts.filter((a: any) => a.status === "Active").length})
            </p>

            <Tabs value={filter} onValueChange={setFilter}>
               <TabsList>
                  <TabsTrigger value="recent">Time</TabsTrigger>
                  <TabsTrigger value="level">Level</TabsTrigger>
               </TabsList>
            </Tabs>
         </CardHeader>

         <CardContent className="pr-1 pl-5 flex-1">
            <ScrollArea className="h-[calc(100vh-31rem)] pr-4">
               <div className="space-y-3">
                  {alerts
                     .filter((alert: any) => alert.status === "Active")
                     .sort(
                        (
                          a: { alertLevel: "Immediate" | "Urgent" | "Non-Urgent"; _creationTime: number },
                          b: { alertLevel: "Immediate" | "Urgent" | "Non-Urgent"; _creationTime: number }
                        ) => {
                          const priority = { Immediate: 1, Urgent: 2, "Non-Urgent": 3 };
                      
                          if (filter === "level") {
                            const levelDiff = (priority[a.alertLevel] || 99) - (priority[b.alertLevel] || 99);
                            if (levelDiff !== 0) return levelDiff;
                            return a._creationTime - b._creationTime;
                          }
               
                          return a._creationTime - b._creationTime;
                        }
                      )                    
                     .map((alert: any) => (
                        <button
                           key={alert._id}
                           className={
                              "text-left w-full bg-secondary rounded-lg p-1"
                           }
                           onClick={() => openSheet(alert)}
                        >
                           <div className="rounded-md px-4 py-3 hover:bg-gray-200 cursor-pointer transition flex flex-row justify-between items-center">
                              <div className="flex flex-row">
                                 <img
                                    src={categoryToIcon[alert.category]}
                                    alt="Alert Icon"
                                    className="w-10 h-10 mr-4"
                                 />
                                 <div className="-mt-1 max-w-60">
                                    <p className="font-poppinsBold">
                                       {alert.userName}
                                    </p>
                                    <p className="font-poppins text-sm">
                                       {alert.location}
                                    </p>
                                 </div>
                              </div>
                              <div className="flex text-right items-center">
                                 <p className="text-sm min-w-20 max-w-24 opacity-50">
                                    {timeAgo(alert._creationTime)}
                                 </p>
                                 <div
                                    className={`rounded-full ml-3 w-2 h-6 ${
                                       alert.alertLevel === "Non-Urgent"
                                          ? "bg-[#51ad5d]"
                                          : alert.alertLevel === "Urgent"
                                            ? "bg-[#ffb300]"
                                            : alert.alertLevel === "Immediate"
                                              ? "bg-[#ff4545]"
                                              : "bg-gray-300"
                                    }`}
                                 />
                              </div>
                           </div>
                        </button>
                     ))}
               </div>
            </ScrollArea>
         </CardContent>
      </Card>
   );
}