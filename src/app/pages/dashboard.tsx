// src/pages/dashboard.tsx
import { AlertCard } from "@/components/alert-card";
import MapSection from "@/components/map-section";
import { ChartArea } from "@/components/chart-area";
import { AlertSheet } from "@/components/alert-sheet";

export default function Dashboard() {
  return (
    <div className="lg:flex h-[94dvh] p-4 gap-4">
      <div className="flex flex-col gap-4 lg:w-200">
        <ChartArea />
        <AlertCard />
      </div>
      <MapSection />
      <AlertSheet />
    </div>
  );
}
