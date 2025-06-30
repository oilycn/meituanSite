"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FindNearestStationsOutput } from "@/ai/flows/find-nearest-stations";
import { cn } from "@/lib/utils";
import { Car, Phone, MapPin, Clock, Footprints, Bike, Bus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StationDetailsProps {
  stations: FindNearestStationsOutput['stations'];
  selectedStationIndex: number | null;
  onStationSelect: (index: number | null) => void;
  routeDetails: { distance: string; time: string; } | null;
  travelMode: 'driving' | 'walking' | 'biking' | 'transit';
  onTravelModeChange: (mode: 'driving' | 'walking' | 'biking' | 'transit') => void;
}

const travelModeConfig = {
    driving: { icon: Car, label: "驾车" },
    walking: { icon: Footprints, label: "步行" },
    biking: { icon: Bike, label: "骑行" },
    transit: { icon: Bus, label: "公交" },
};

export function StationDetails({ stations, selectedStationIndex, onStationSelect, routeDetails, travelMode, onTravelModeChange }: StationDetailsProps) {
  if (stations.length === 0) {
    return null;
  }
  const CurrentIcon = travelModeConfig[travelMode].icon;

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
                
                {selectedStationIndex === index && (
                    <div className="mt-3 space-y-3">
                         <Tabs value={travelMode} onValueChange={(value) => onTravelModeChange(value as any)} className="w-full">
                            <TabsList className="grid w-full grid-cols-4 h-auto">
                                <TabsTrigger value="driving" className="flex-col gap-1 py-2 h-auto"><Car className="w-5 h-5"/>驾车</TabsTrigger>
                                <TabsTrigger value="walking" className="flex-col gap-1 py-2 h-auto"><Footprints className="w-5 h-5"/>步行</TabsTrigger>
                                <TabsTrigger value="biking" className="flex-col gap-1 py-2 h-auto"><Bike className="w-5 h-5"/>骑行</TabsTrigger>
                                <TabsTrigger value="transit" className="flex-col gap-1 py-2 h-auto"><Bus className="w-5 h-5"/>公交</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        {routeDetails ? (
                            <div className="p-3 bg-accent/20 rounded-md border border-accent/50">
                                <div className="flex items-center justify-between gap-4 text-sm font-medium">
                                    <div className="flex items-center gap-2 text-accent-foreground font-bold">
                                        <CurrentIcon className="w-5 h-5" />
                                        <span>{travelModeConfig[travelMode].label}方案</span>
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
                        ) : (
                            <div className="p-3 text-sm text-center text-muted-foreground animate-pulse">正在计算路线...</div>
                        )}
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
