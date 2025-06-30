"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FindNearestStationsOutput } from "@/ai/flows/find-nearest-stations";
import { cn } from "@/lib/utils";
import { Car, Phone, MapPin, Clock, Footprints, Bike, Bus, Copy } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface StationDetailsProps {
  stations: FindNearestStationsOutput['stations'];
  selectedStationIndex: number | null;
  onStationSelect: (index: number | null) => void;
  routeDetails: { distance: string; time: string; } | null;
  travelMode: 'driving' | 'walking' | 'biking' | 'transit';
  onTravelModeChange: (mode: 'driving' | 'walking' | 'biking' | 'transit') => void;
  userAddress: string | null;
  userCoordinates: { latitude: number; longitude: number } | null;
}

const travelModeConfig = {
    driving: { icon: Car, label: "驾车" },
    walking: { icon: Footprints, label: "步行" },
    biking: { icon: Bike, label: "骑行" },
    transit: { icon: Bus, label: "公交" },
};

export function StationDetails({ stations, selectedStationIndex, onStationSelect, routeDetails, travelMode, onTravelModeChange, userAddress, userCoordinates }: StationDetailsProps) {
  const { toast } = useToast();
  
  const handleCopyCoords = () => {
    if (userCoordinates) {
      const coordsString = `${userCoordinates.latitude}, ${userCoordinates.longitude}`;
      navigator.clipboard.writeText(coordsString).then(() => {
        toast({
          title: "复制成功",
          description: `经纬度 (${coordsString}) 已复制到剪贴板。`,
        });
      }, (err) => {
        toast({
          variant: "destructive",
          title: "复制失败",
          description: "无法将经纬度复制到剪贴板。",
        });
        console.error('Could not copy text: ', err);
      });
    }
  };

  if (stations.length === 0) {
    return null;
  }
  const CurrentIcon = travelModeConfig[travelMode].icon;

  return (
    <Card className="shadow-2xl max-h-[60vh] md:max-h-[calc(100vh-140px)] flex flex-col rounded-xl md:rounded-lg bg-background/90 backdrop-blur-sm md:bg-card md:backdrop-blur-none">
      <CardHeader>
        <CardTitle>附近站点列表</CardTitle>
        {userAddress ? (
            <div className="flex items-center justify-between gap-2 pt-1">
                <div className="flex items-start gap-1.5 text-sm text-muted-foreground flex-1 min-w-0">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary"/>
                    <span className="truncate">您的位置: {userAddress}</span>
                </div>
                {userCoordinates && (
                    <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={handleCopyCoords} aria-label="复制经纬度">
                        <Copy className="w-4 h-4" />
                    </Button>
                )}
            </div>
        ) : (
            <CardDescription>共找到 {stations.length} 个站点，按距离排序。</CardDescription>
        )}
      </CardHeader>
      
      <div className="px-6 pb-4 border-b">
        <Tabs value={travelMode} onValueChange={(value) => onTravelModeChange(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto">
                <TabsTrigger value="driving" className="flex-col gap-1 py-2 h-auto"><Car className="w-5 h-5"/>驾车</TabsTrigger>
                <TabsTrigger value="walking" className="flex-col gap-1 py-2 h-auto"><Footprints className="w-5 h-5"/>步行</TabsTrigger>
                <TabsTrigger value="biking" className="flex-col gap-1 py-2 h-auto"><Bike className="w-5 h-5"/>骑行</TabsTrigger>
                <TabsTrigger value="transit" className="flex-col gap-1 py-2 h-auto"><Bus className="w-5 h-5"/>公交</TabsTrigger>
            </TabsList>
        </Tabs>
      </div>

      <CardContent className="p-0 flex-grow overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-4">
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
