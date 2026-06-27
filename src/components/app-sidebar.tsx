import { Users, House, ChartPie, Settings } from "lucide-react";
import ersq from "../assets/images/ersq.png";

import {
   Sidebar,
   SidebarContent,
   SidebarFooter,
   SidebarGroup,
   SidebarGroupContent,
   SidebarHeader,
   SidebarMenu,
   SidebarMenuButton,
   SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { SettingsDialog } from "./settings-dialog";

const items = [
   {
      title: "Overview",
      url: "/",
      icon: House,
   },
   {
      title: "User Management",
      url: "/user-management",
      icon: Users,
   },
   {
      title: "Reports & Analytics",
      url: "/reports",
      icon: ChartPie,
   },
];

const footerItems = [
   {
      title: "Settings",
      url: "#",
      icon: Settings,
   },
];

const headerItems = [
   {
      title: "Dashboard",
   }
]

export function AppSidebar() {
   return (
      <Sidebar collapsible="icon">
         <SidebarHeader>
         {headerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton asChild className="mt-3 pointer-events-none">
                        <div>
                           <img src={ersq} alt="Logo" className="absolute w-5 h-5 -ml-0.5"/>
                           <span className="ml-7 font-poppinsBold text-xl">{item.title}</span>
                        </div>
                     </SidebarMenuButton>
                  </SidebarMenuItem>
               ))}
         </SidebarHeader>
         <SidebarContent>
            <SidebarGroup>
               <SidebarGroupContent>
                  <SidebarMenu>
                     {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                           <SidebarMenuButton asChild>
                              <Link to={item.url} className="font-poppins text-xs mb-1">
                                 <item.icon />
                                 <span className="ml-1">{item.title}</span>
                              </Link>
                           </SidebarMenuButton>
                        </SidebarMenuItem>
                     ))}
                  </SidebarMenu>
               </SidebarGroupContent>
            </SidebarGroup>
         </SidebarContent>
         <SidebarFooter>
            <SidebarMenu>
               {footerItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton asChild>
                     <SettingsDialog />
                     </SidebarMenuButton>
                  </SidebarMenuItem>
               ))}
            </SidebarMenu>
         </SidebarFooter>
      </Sidebar>
   );
}
