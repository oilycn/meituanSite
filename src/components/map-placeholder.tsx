"use client";

import React, { useEffect, useRef, useState } from 'react';
import AMapLoader from '@amap/amap-jsapi-loader';
import { Skeleton } from './ui/skeleton';
import type { FindNearestStationsOutput } from "@/ai/flows/find-nearest-stations";
import { MapPin, AlertTriangle } from 'lucide-react';

interface MapComponentProps {
  stations: FindNearestStationsOutput['stations'];
  userCoordinates: { latitude: number; longitude: number } | null;
  selectedStationIndex: number | null;
  onStationSelect: (index: number | null) => void;
  userAddress: string | null;
}

// Extend Window interface for AMap
declare global {
  interface Window {
    _AMapSecurityConfig: {
      securityJsCode: string;
    };
    AMap: any;
  }
}

export function MapComponent({
  stations,
  userCoordinates,
  selectedStationIndex,
  onStationSelect,
  userAddress
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const userMarker = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AMAP_KEY && process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE) {
        window._AMapSecurityConfig = {
            securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE,
        };
    }

    AMapLoader.load({
      key: process.env.NEXT_PUBLIC_AMAP_KEY || "", // Amap Key
      version: "2.0",
      plugins: ['AMap.Marker', 'AMap.Icon', 'AMap.Pixel'],
    })
      .then((AMap) => {
        setIsApiLoaded(true);
      })
      .catch((e) => {
        console.error("Failed to load AMap:", e);
        setLoadError("地图加载失败。请检查您的网络连接、API密钥是否正确，或稍后重试。");
      });
  }, []);

  useEffect(() => {
    if (isApiLoaded && mapContainer.current && !map.current) {
        const AMap = window.AMap;
        map.current = new AMap.Map(mapContainer.current, {
            zoom: 14,
            center: [121.4737, 31.2304], // Default to Shanghai People's Square
            viewMode: '2D',
            mapStyle: 'amap://styles/whitesmoke',
        });
        
        map.current.on('complete', () => {
             setIsMapLoaded(true);
        });

        return () => {
            map.current?.destroy();
            map.current = null;
        };
    }
  }, [isApiLoaded]);

  useEffect(() => {
    if (isMapLoaded) {
      const AMap = window.AMap;
      // Clear previous markers
      map.current.remove(markers.current);
      markers.current = [];
      if (userMarker.current) {
        map.current.remove(userMarker.current);
        userMarker.current = null;
      }

      const allMapElements: any[] = [];

      // Add user marker
      if (userCoordinates) {
        const userIcon = new AMap.Icon({
          size: new AMap.Size(40, 40),
          image:
            'data:image/svg+xml;charset=utf-8,' +
            encodeURIComponent(
              '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="hsl(var(--destructive))" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>'
            ),
          imageSize: new AMap.Size(40, 40),
        });
        userMarker.current = new AMap.Marker({
          position: [userCoordinates.longitude, userCoordinates.latitude],
          map: map.current,
          icon: userIcon,
          anchor: 'bottom-center',
          title: userAddress || '',
        });
        allMapElements.push(userMarker.current);
      }

      // Add station markers
      stations.forEach((station, index) => {
        const isSelected = selectedStationIndex === index;
        const markerContent = `
            <div style="position: relative; text-align: center; color: white; font-weight: bold; font-size: 14px; width: 32px; height: 32px;
                        background-color: ${
                          isSelected
                            ? 'hsl(var(--accent))'
                            : 'hsl(var(--primary))'
                        };
                        border-radius: 50%; display: flex; align-items: center; justify-content: center;
                        border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                        transform: ${
                          isSelected ? 'scale(1.2)' : 'scale(1)'
                        }; transition: transform 0.2s ease; cursor: pointer;">
                ${index + 1}
            </div>
        `;

        const marker = new AMap.Marker({
          position: [station.longitude, station.latitude],
          map: map.current,
          content: markerContent,
          anchor: 'center',
          title: station.name,
        });

        marker.on('click', () => {
          onStationSelect(index === selectedStationIndex ? null : index);
        });

        markers.current.push(marker);
        allMapElements.push(marker);
      });

      // Set map view to fit all markers
      if (allMapElements.length > 0) {
        map.current.setFitView(
          allMapElements,
          false, // animate
          [80, 80, 80, 80], // padding [B, R, T, L]
          16 // maxZoom
        );
      }
    }
  }, [
    stations,
    userCoordinates,
    userAddress,
    isMapLoaded,
    selectedStationIndex,
    onStationSelect,
  ]);

  useEffect(() => {
    if (isMapLoaded && selectedStationIndex !== null && stations[selectedStationIndex]) {
        const station = stations[selectedStationIndex];
        map.current.panTo([station.longitude, station.latitude]);
        map.current.setZoom(15);
    }
  }, [selectedStationIndex, isMapLoaded, stations]);


  if (!process.env.NEXT_PUBLIC_AMAP_KEY || !process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE) {
      return (
          <div className="relative w-full h-full rounded-xl overflow-hidden bg-muted border shadow-lg flex items-center justify-center text-center text-muted-foreground p-4">
              <div>
                  <MapPin className="mx-auto h-12 w-12" />
                  <p className="mt-4 font-medium">高德地图API密钥未配置</p>
                  <p className="text-sm mt-2">请在 `.env` 文件中设置 `NEXT_PUBLIC_AMAP_KEY` 和 `NEXT_PUBLIC_AMAP_SECURITY_JS_CODE` 来启用地图功能。</p>
              </div>
          </div>
      );
  }
  
  if (loadError) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden bg-destructive/10 border border-destructive/50 shadow-lg flex items-center justify-center text-center text-destructive p-4">
          <div>
              <AlertTriangle className="mx-auto h-12 w-12" />
              <p className="mt-4 font-medium">地图加载错误</p>
              <p className="text-sm mt-2 max-w-sm mx-auto">{loadError}</p>
          </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-muted border shadow-lg">
      <div ref={mapContainer} className="w-full h-full" />
      {!isMapLoaded && <Skeleton className="absolute inset-0" />}
    </div>
  );
}
