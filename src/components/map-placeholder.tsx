"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import type { FindNearestStationsOutput } from "@/ai/flows/find-nearest-stations";
import { MapPin, AlertTriangle } from 'lucide-react';

interface MapComponentProps {
  stations: FindNearestStationsOutput['stations'];
  userCoordinates: { latitude: number; longitude: number } | null;
  selectedStationIndex: number | null;
  onStationSelect: (index: number | null) => void;
  userAddress: string | null;
  onRoutePlanned: (details: { distance: string; time: string } | null) => void;
  travelMode: 'driving' | 'walking' | 'biking' | 'transit';
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
  userAddress,
  onRoutePlanned,
  travelMode,
}: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const markers = useRef<any[]>([]);
  const userMarker = useRef<any>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isApiLoaded, setIsApiLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [driving, setDriving] = useState<any>(null);
  const [walking, setWalking] = useState<any>(null);
  const [riding, setRiding] = useState<any>(null);
  const [transfer, setTransfer] = useState<any>(null);


  useEffect(() => {
    if (process.env.NEXT_PUBLIC_AMAP_KEY && process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE) {
        window._AMapSecurityConfig = {
            securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE,
        };
    }

    import('@amap/amap-jsapi-loader').then(({ default: AMapLoader }) => {
        AMapLoader.load({
        key: process.env.NEXT_PUBLIC_AMAP_KEY || "",
        version: "2.0",
        plugins: ['AMap.Marker', 'AMap.Icon', 'AMap.Pixel', 'AMap.Driving', 'AMap.Walking', 'AMap.Riding', 'AMap.Transfer'],
        })
        .then((AMap) => {
            setIsApiLoaded(true);
        })
        .catch((e) => {
            console.error("Failed to load AMap:", e);
            setLoadError("地图加载失败。请检查您的网络连接、API密钥是否正确，或稍后重试。");
        });
    });
  }, []);

  useEffect(() => {
    if (isApiLoaded && mapContainer.current && !map.current) {
        const AMap = window.AMap;
        map.current = new AMap.Map(mapContainer.current, {
            zoom: 11,
            center: [114.3055, 30.5928], // Wuhan center
            viewMode: '2D',
            mapStyle: 'amap://styles/whitesmoke',
        });

        setDriving(new AMap.Driving({ map: map.current, policy: AMap.DrivingPolicy.LEAST_TIME }));
        setWalking(new AMap.Walking({ map: map.current }));
        setRiding(new AMap.Riding({ map: map.current }));
        setTransfer(new AMap.Transfer({ map: map.current, policy: AMap.TransferPolicy.LEAST_TIME, city: '武汉市' }));
        
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
      map.current.remove(markers.current);
      markers.current = [];
      if (userMarker.current) {
        map.current.remove(userMarker.current);
        userMarker.current = null;
      }

      const allMapElements: any[] = [];

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
          title: userAddress || '您的位置',
        });
        allMapElements.push(userMarker.current);
      }

      stations.forEach((station, index) => {
        const isSelected = selectedStationIndex === index;
        const distanceInfo = index < 3 && station.distance > 0
          ? `<div style="background-color: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); border-radius: 9999px; padding: 2px 8px; font-size: 12px; font-weight: 700; margin-top: 5px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">${station.distance.toFixed(2)} km</div>`
          : '';

        const markerContent = `
          <div style="position: relative; text-align: center; width: auto; cursor: pointer; display: flex; flex-direction: column; align-items: center;">
            <div style="position: relative; text-align: center; color: white; font-weight: bold; font-size: 14px; width: 28px; height: 28px; background-color: ${
              isSelected ? 'hsl(var(--accent))' : 'hsl(var(--primary))'
            }; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transform: ${
              isSelected ? 'scale(1.2)' : 'scale(1)'
            }; transition: transform 0.2s ease;">
              ${index + 1}
            </div>
            <div style="background-color: rgba(255, 255, 255, 0.9); border-radius: 4px; padding: 2px 6px; font-size: 12px; color: #333; white-space: nowrap; margin-top: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.2); font-weight: 500;">
              ${station.name}
            </div>
            ${distanceInfo}
          </div>
        `;
        const marker = new AMap.Marker({
          position: [station.longitude, station.latitude],
          map: map.current,
          content: markerContent,
          anchor: 'bottom-center',
          title: station.name,
        });

        marker.on('click', () => {
          onStationSelect(index === selectedStationIndex ? null : index);
        });

        markers.current.push(marker);
        allMapElements.push(marker);
      });

      if (allMapElements.length > 0 && selectedStationIndex === null) {
        map.current.setFitView(
          allMapElements,
          false,
          [100, 100, 100, 420],
          16
        );
      }
    }
  }, [stations, userCoordinates, userAddress, isMapLoaded, selectedStationIndex, onStationSelect]);

  useEffect(() => {
    driving?.clear();
    walking?.clear();
    riding?.clear();
    transfer?.clear();
    onRoutePlanned(null);

    if (isMapLoaded && selectedStationIndex !== null && userCoordinates && stations[selectedStationIndex]) {
        const startLngLat = [userCoordinates.longitude, userCoordinates.latitude];
        const endLngLat = [stations[selectedStationIndex].longitude, stations[selectedStationIndex].latitude];

        const onSearchResult = (status: string, result: any) => {
            if (status === 'complete') {
                if ((result.routes && result.routes.length > 0) || (result.plans && result.plans.length > 0)) {
                    map.current.setFitView([userMarker.current, markers.current[selectedStationIndex]], false, [80, 80, 80, 420], 16);

                    let distance = 0;
                    let time = 0;

                    if (result.routes && result.routes.length > 0) { // Driving, Walking, Biking
                        distance = result.routes[0].distance;
                        time = result.routes[0].time;
                    } else if (result.plans && result.plans.length > 0) { // Transit
                        distance = result.plans[0].distance;
                        time = result.plans[0].time;
                    }

                    const distanceInKm = (distance / 1000).toFixed(2);
                    const timeInMinutes = Math.round(time / 60);
                    onRoutePlanned({
                        distance: `${distanceInKm} 公里`,
                        time: `${timeInMinutes} 分钟`,
                    });
                } else {
                    console.error(`获取${travelMode}路线失败，结果为空`, result);
                    onRoutePlanned({ distance: '无法规划', time: '路线' });
                }
            } else {
                console.error(`获取${travelMode}数据显示失败`, result);
                onRoutePlanned({ distance: '无法规划', time: '路线' });
            }
        };

        switch (travelMode) {
            case 'driving':
                if (driving) driving.search(startLngLat, endLngLat, onSearchResult);
                break;
            case 'walking':
                if (walking) walking.search(startLngLat, endLngLat, onSearchResult);
                break;
            case 'biking':
                if (riding) riding.search(startLngLat, endLngLat, onSearchResult);
                break;
            case 'transit':
                if (transfer) transfer.search(startLngLat, endLngLat, onSearchResult);
                break;
        }
    }
  }, [selectedStationIndex, userCoordinates, travelMode, stations, onRoutePlanned, isMapLoaded, driving, walking, riding, transfer]);

  if (!process.env.NEXT_PUBLIC_AMAP_KEY || !process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE) {
      return (
          <div className="relative w-full h-full bg-muted flex items-center justify-center text-center text-muted-foreground p-4">
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
      <div className="relative w-full h-full bg-destructive/10 border border-destructive/50 flex items-center justify-center text-center text-destructive p-4">
          <div>
              <AlertTriangle className="mx-auto h-12 w-12" />
              <p className="mt-4 font-medium">地图加载错误</p>
              <p className="text-sm mt-2 max-w-sm mx-auto">{loadError}</p>
          </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-muted">
      <div ref={mapContainer} className="w-full h-full" />
      {!isMapLoaded && <Skeleton className="absolute inset-0" />}
    </div>
  );
}
