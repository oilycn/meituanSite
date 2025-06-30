"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FindNearestStationsOutput } from "@/ai/flows/find-nearest-stations";
import { cn } from "@/lib/utils";
import { Car, Phone, MapPin, Clock } from "lucide-react";

interface StationDetailsProps {
  stations: FindNearestStationsOutput['stations'];
  selectedStationIndex: number | null;
  onStationSelect: (index: number | null) => void;
  routeDetails: { distance: string; time: string; } | null;
}

export function StationDetails({ stations, selectedStationIndex, onStationSelect, routeDetails }: StationDetailsProps) {
  if (stations.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-2xl max-h-[calc(100vh-140px)] flex flex-col">
      <CardHeader>
        <CardTitle>附近站点列表</CardTitle>
        <CardDescription>共找到 {stations.length} 个站点，按距离排序。</CardDescription>
      </CardHeader>
      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-4 pt-0">
            {stations.map((station, index) => (
              <div
                key={index}
                className={cn(
                  "p-3 rounded-lg cursor-pointer border-2 transition-all",
                  selectedStationIndex === index ? "border-primary bg-primary/10" : "border-transparent hover:bg-muted"
                )}
                onClick={() => onStationSelect(index === selectedStationIndex ? null : index)}
              >
                <div className="flex justify-between items-start">
                  <div className="font-bold text-md pr-2">
                    {index + 1}. {station.name}
                  </div>
                  {station.distance > 0 && (
                     <div className="text-sm font-semibold text-primary whitespace-nowrap">
                        {station.distance.toFixed(2)} km
                     </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1 flex items-start gap-2">
                   <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" /> 
                   <span>{station.address}</span>
                </div>
                {station.phoneNumber !== '未知' && (
                  <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span>{station.phoneNumber}</span>
                  </div>
                )}
                
                {selectedStationIndex === index && routeDetails && (
                    <div className="mt-3 p-3 bg-accent/20 rounded-md border border-accent/50">
                        <div className="flex items-center justify-between gap-4 text-sm font-medium">
                            <div className="flex items-center gap-2 text-accent-foreground font-bold">
                                <Car className="w-5 h-5" />
                                <span>驾车方案</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <Clock className="w-4 h-4" />
                               <span>{routeDetails.time}</span>
                            </div>
                             <div className="flex items-center gap-2">
                               <MapPin className="w-4 h-4" />
                               <span>{routeDetails.distance}</span>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
