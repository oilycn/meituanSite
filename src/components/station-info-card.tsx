import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Store } from "lucide-react";
import type { FindNearestStationsOutput } from "@/ai/flows/find-nearest-stations";
import { cn } from "@/lib/utils";

type StationInfoCardProps = {
  station: FindNearestStationsOutput[number];
  index: number;
  isSelected: boolean;
  onClick: () => void;
};

export function StationInfoCard({ station, index, isSelected, onClick }: StationInfoCardProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected ? "ring-2 ring-primary shadow-lg" : "bg-card"
      )}
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
    >
      <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-4">
        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold text-lg shadow-sm">
          {index + 1}
        </div>
        <div className="flex-grow">
          <CardTitle className="text-lg leading-tight">{station.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground pt-0">
        <div className="flex items-start gap-3">
          <Store className="w-4 h-4 mt-0.5 flex-shrink-0 text-accent" />
          <span className="text-foreground/90">{station.address}</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-4 h-4 flex-shrink-0 text-accent" />
          <span className="text-foreground/90">{station.phoneNumber}</span>
        </div>
      </CardContent>
    </Card>
  );
}
