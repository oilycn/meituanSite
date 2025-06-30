"use client";

import Image from "next/image";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FindNearestStationsOutput } from "@/ai/flows/find-nearest-stations";

type MapPlaceholderProps = {
  stations: FindNearestStationsOutput;
  userAddress: string | null;
  selectedStationIndex: number | null;
  onStationSelect: (index: number | null) => void;
};

const markerPositions = [
  { top: "30%", left: "25%" },
  { top: "65%", left: "35%" },
  { top: "40%", left: "70%" },
];
const userPosition = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

export function MapPlaceholder({
  stations,
  userAddress,
  selectedStationIndex,
  onStationSelect,
}: MapPlaceholderProps) {
  return (
    <div className="relative w-full aspect-square lg:aspect-auto lg:h-full min-h-[400px] rounded-xl overflow-hidden bg-muted border shadow-lg">
      <Image
        src="https://placehold.co/1200x1200.png"
        alt="Map background"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="opacity-10 object-cover"
        data-ai-hint="abstract map pattern"
      />
      <div className="absolute inset-0 transition-opacity duration-500" style={{ opacity: userAddress ? 1 : 0 }}>
        {userAddress && (
          <div
            className="absolute transition-all duration-500 ease-in-out"
            style={{ ...userPosition }}
            title={userAddress}
          >
            <div className="relative flex flex-col items-center animate-in fade-in zoom-in-50">
              <MapPin
                className="w-10 h-10 text-destructive drop-shadow-lg"
                style={{ fill: "hsl(var(--destructive) / 0.4)"}}
              />
              <span className="mt-2 px-3 py-1 text-sm font-bold text-white bg-destructive rounded-full shadow-lg">
                您
              </span>
            </div>
          </div>
        )}

        {stations.map((station, index) => (
          <button
            key={station.name}
            className="absolute transition-all duration-300"
            style={{ ...markerPositions[index], transform: "translate(-50%, -50%)" }}
            onClick={() => onStationSelect(index === selectedStationIndex ? null : index)}
            aria-label={`选择站点：${station.name}`}
          >
            <div
              className={cn(
                "relative flex flex-col items-center cursor-pointer transform-gpu transition-transform duration-300 ease-out animate-in fade-in zoom-in-50",
                selectedStationIndex === index ? "scale-125 z-10" : "scale-100"
              )}
              style={{ animationDelay: `${(index + 1) * 100}ms`}}
            >
              <MapPin
                className={cn(
                  "w-8 h-8 text-primary drop-shadow-md transition-all duration-300",
                )}
                style={{ fill: `hsl(var(--primary) / ${selectedStationIndex === index ? '0.6' : '0.3'})`}}
              />
              <span
                className={cn(
                  "mt-2 px-2 py-0.5 text-xs font-semibold text-primary-foreground bg-primary rounded-full shadow-md whitespace-nowrap transition-all duration-300",
                  selectedStationIndex === index && "ring-2 ring-offset-2 ring-offset-background ring-primary"
                )}
              >
                {index + 1}
              </span>
            </div>
          </button>
        ))}
      </div>
       {!userAddress && (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
                <MapPin className="mx-auto h-12 w-12" />
                <p className="mt-4 font-medium">地图将在此处显示</p>
            </div>
        </div>
      )}
    </div>
  );
}
