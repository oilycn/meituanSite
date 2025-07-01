"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search, MapPin, History, ArrowLeft } from "lucide-react";
import dynamic from 'next/dynamic';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { getNearestStations } from "@/app/actions";
import { MeituanIcon } from "@/components/icons";
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";
import type { FindNearestStationsOutput } from "@/ai/flows/find-nearest-stations";
import { wuhanStations } from "@/lib/stations";
import { StationDetails } from "@/components/station-details";


const MapComponent = dynamic(
  () => import('@/components/map-placeholder').then((mod) => mod.MapComponent),
  { 
    ssr: false,
    loading: () => <div className="relative w-full h-full bg-muted"><Skeleton className="absolute inset-0" /></div>
  }
);

const formSchema = z.object({
  address: z.string().min(2, {
    message: "请输入更详细的地址。",
  }),
});

// Extend Window interface for AMap
declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode: string;
    };
    AMap: any;
  }
}

export default function Home() {
  const { toast } = useToast();
  const [stations, setStations] = useState<FindNearestStationsOutput['stations']>([]);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedStationIndex, setSelectedStationIndex] = useState<number | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<{latitude: number, longitude: number} | null>(null);

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverMode, setPopoverMode] = useState<'suggestions' | 'history'>('suggestions');
  const [addressHistory, setAddressHistory] = useState<string[]>([]);
  
  const [geocoder, setGeocoder] = useState<any>(null);
  const [autoComplete, setAutoComplete] = useState<any>(null);

  const [viewMode, setViewMode] = useState<'search' | 'results'>('search');
  const [routeDetails, setRouteDetails] = useState<{ distance: string; time: string; } | null>(null);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'biking' | 'transit'>('driving');


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  });

  const addressValue = form.watch("address");

  const resetToInitialState = useCallback(() => {
    const initialStations = wuhanStations.map(station => ({
      ...station,
      distance: 0,
    }));
    setStations(initialStations);
    setUserAddress(null);
    setUserCoordinates(null);
    setSelectedStationIndex(null);
    setRouteDetails(null);
    setIsLoading(false);
    setViewMode('search');
  }, []);

  useEffect(() => {
    try {
      const history = localStorage.getItem('meituan_address_history');
      if (history) {
        setAddressHistory(JSON.parse(history));
      }
    } catch (e) {
      console.error("Failed to load address history from localStorage", e);
    }

    import('@amap/amap-jsapi-loader').then(({ default: AMapLoader }) => {
        if (process.env.NEXT_PUBLIC_AMAP_KEY && process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE) {
            window._AMapSecurityConfig = {
                securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE,
            };
        }

        AMapLoader.load({
          key: process.env.NEXT_PUBLIC_AMAP_KEY || "",
          version: "2.0",
          plugins: ['AMap.Geocoder', 'AMap.AutoComplete'],
        })
          .then((AMap) => {
            setGeocoder(new AMap.Geocoder({ city: '全国' }));
            setAutoComplete(new AMap.AutoComplete({ city: '全国' }));
            resetToInitialState();
          })
          .catch((e) => {
            console.error("Failed to load AMap services:", e);
            toast({
                variant: "destructive",
                title: "错误",
                description: "地图服务加载失败。",
            });
             setIsLoading(false);
          });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!addressValue || addressValue.length < 2 || !autoComplete) {
      setSuggestions([]);
       if (document.activeElement?.getAttribute('name') !== 'address') {
          setIsPopoverOpen(false);
       }
      return;
    }

    const handler = setTimeout(() => {
      autoComplete.search(addressValue, (status: string, result: any) => {
        if (status === 'complete' && result.tips && result.tips.length > 0) {
            setSuggestions(result.tips.filter((tip: any) => tip.id && tip.name));
            setPopoverMode('suggestions');
            setIsPopoverOpen(true);
        } else {
            setSuggestions([]);
            setIsPopoverOpen(false);
        }
      });
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [addressValue, autoComplete]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!geocoder) {
      toast({ variant: "destructive", title: "错误", description: "地理编码服务尚未准备好，请稍候重试。" });
      return;
    }

    setIsPopoverOpen(false);
    setIsSearching(true);
    setUserAddress(values.address);
    setSelectedStationIndex(null);
    setUserCoordinates(null);
    setRouteDetails(null);

    const geocodePromise = new Promise<{latitude: number, longitude: number} | null>((resolve) => {
      geocoder.getLocation(values.address, (status: string, result: any) => {
        if (status === 'complete' && result.geocodes.length > 0) {
          const { lat, lng } = result.geocodes[0].location;
          resolve({ latitude: lat, longitude: lng });
        } else {
          resolve(null);
        }
      });
    });

    try {
      const coords = await geocodePromise;
      if(coords) {
        setUserCoordinates(coords);
        const result = await getNearestStations(coords);
        if (result.error) {
          toast({ variant: "destructive", title: "错误", description: result.error });
        } else if (result.data) {
          setStations(result.data.stations);
          setViewMode('results');
           const newHistory = [
             values.address,
             ...addressHistory.filter(item => item !== values.address)
           ].slice(0, 5); 
           setAddressHistory(newHistory);
           localStorage.setItem('meituan_address_history', JSON.stringify(newHistory));

          if (result.data.stations.length === 0) {
            toast({
                title: "未找到站点",
                description: "我们未能找到该地址附近的任何站点。",
            });
          }
        }
      } else {
         toast({ variant: "destructive", title: "地址解析失败", description: "无法找到该地址的坐标。" });
      }
    } catch(err: any) {
       toast({ variant: "destructive", title: "搜索失败", description: err.message });
    } finally {
      setIsSearching(false);
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    form.setValue("address", suggestion, { shouldValidate: true });
    setIsPopoverOpen(false);
    onSubmit({ address: suggestion });
  };
  
  const handleHistoryClick = (address: string) => {
    form.setValue("address", address, { shouldValidate: true });
    setIsPopoverOpen(false);
    onSubmit({ address: address });
  };
  
  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      toast({ variant: 'destructive', title: '定位失败', description: '您的浏览器不支持定位功能。' });
      return;
    }
  
    if (!geocoder) {
      toast({ variant: 'destructive', title: '错误', description: '地理编码服务尚未准备好，请稍后再试。' });
      return;
    }
  
    setIsLocating(true);
    form.setValue('address', '正在定位...');
  
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
  
      const { latitude, longitude } = position.coords;
      const coords = { latitude, longitude };
  
      setSelectedStationIndex(null);
      setRouteDetails(null);
      setUserCoordinates(coords);
  
      const stationsPromise = getNearestStations(coords);
      const addressPromise = new Promise<string>((resolve) => {
        geocoder.getAddress([longitude, latitude], (status: string, result: any) => {
          if (status === 'complete' && result.regeocode) {
            resolve(result.regeocode.formattedAddress);
          } else {
            console.error('逆地理编码失败', result);
            resolve('我的位置');
          }
        });
      });
  
      const [stationResult, locatedAddress] = await Promise.all([stationsPromise, addressPromise]);
  
      if (stationResult.error) {
        toast({ variant: 'destructive', title: '站点搜索失败', description: stationResult.error });
      } else if (stationResult.data) {
        setStations(stationResult.data.stations);
        setViewMode('results');
      }
  
      form.setValue('address', locatedAddress);
      setUserAddress(locatedAddress);
  
      if (locatedAddress !== '我的位置') {
        const newHistory = [
          locatedAddress,
          ...addressHistory.filter((item) => item !== locatedAddress),
        ].slice(0, 5);
        setAddressHistory(newHistory);
        localStorage.setItem('meituan_address_history', JSON.stringify(newHistory));
      } else {
        toast({ title: '定位成功', description: '已在地图上标记您的位置。' });
      }
    } catch (error: any) {
      let errorMessage = '无法获取您的位置信息。';
      if (error.code === 1) { errorMessage = '定位失败：用户已拒绝共享位置信息。'; }
      else if (error.code === 2) { errorMessage = '定位失败：无法确定设备位置。'; }
      else if (error.code === 3) { errorMessage = '定位失败：请求超时。'; }
      
      toast({ variant: 'destructive', title: '定位失败', description: error.message || errorMessage });
      form.setValue('address', '');
      setUserAddress(null);
    } finally {
      setIsLocating(false);
    }
  };
  
  const handleInputFocus = () => {
    if (!addressValue && addressHistory.length > 0) {
      setPopoverMode('history');
      setIsPopoverOpen(true);
    } else if (addressValue && suggestions.length > 0) {
      setPopoverMode('suggestions');
      setIsPopoverOpen(true);
    }
  };

  const handleStationSelect = useCallback((index: number | null) => {
    setSelectedStationIndex(index);
    if (index === null) {
      setRouteDetails(null);
    }
  }, []);

  const handleTravelModeChange = (mode: 'driving' | 'walking' | 'biking' | 'transit') => {
    setTravelMode(mode);
  };

  const handleNewSearch = () => {
    resetToInitialState();
  };

  const totalLoading = isLoading || isSearching || isLocating;

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-20 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MeituanIcon className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
              美团附近站点查询
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        <div className="absolute inset-0 h-full w-full">
          <MapComponent
            stations={stations}
            userCoordinates={userCoordinates}
            selectedStationIndex={selectedStationIndex}
            onStationSelect={handleStationSelect}
            userAddress={userAddress}
            onRoutePlanned={setRouteDetails}
            travelMode={travelMode}
          />
        </div>

        <div className="absolute bottom-0 left-0 right-0 md:top-4 md:left-4 md:w-full md:max-w-sm md:bottom-auto z-10">
            {viewMode === 'search' ? (
                <Card className="shadow-2xl m-2 md:m-0">
                <CardHeader>
                    <CardTitle>查找附近站点</CardTitle>
                    <CardDescription>输入地址，查找最近的美团站点。</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>您的地址</FormLabel>
                                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                                <PopoverAnchor asChild>
                                    <FormControl>
                                    <div className="relative">
                                        <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="absolute left-1.5 top-1/2 -translate-y-1/2 h-7 w-7 z-10 text-muted-foreground hover:text-foreground"
                                        onClick={handleLocateMe}
                                        disabled={totalLoading}
                                        aria-label="定位到当前位置"
                                        >
                                        {isLocating ? <Loader2 className="animate-spin" /> : <MapPin className="h-5 w-5" />}
                                        </Button>
                                        <Input
                                        placeholder="例如：武汉市常青花园十四小区"
                                        {...field}
                                        autoComplete="off"
                                        className="pl-10"
                                        onFocus={handleInputFocus}
                                        />
                                    </div>
                                    </FormControl>
                                </PopoverAnchor>
                                <PopoverContent 
                                    align="start" 
                                    className="w-[var(--radix-popover-anchor-width)] p-0"
                                    onOpenAutoFocus={(e) => e.preventDefault()}
                                >
                                    {popoverMode === 'suggestions' && suggestions.length > 0 && (
                                    <ul className="py-1">
                                        {suggestions.map((suggestion, index) => (
                                        <li
                                            key={suggestion.id || index}
                                            className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md"
                                            onClick={() => {
                                                const fullAddress = suggestion.district ? `${suggestion.name}, ${suggestion.district}` : suggestion.name;
                                                handleSuggestionClick(fullAddress);
                                            }}
                                            onMouseDown={(e) => e.preventDefault()}
                                        >
                                            <div className="text-sm font-semibold">{suggestion.name}</div>
                                            {suggestion.district && (
                                                <div className="text-xs text-muted-foreground">{suggestion.district}</div>
                                            )}
                                        </li>
                                        ))}
                                    </ul>
                                    )}
                                    {popoverMode === 'history' && addressHistory.length > 0 && (
                                    <div className="py-1">
                                        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground">搜索历史</div>
                                        <ul className="space-y-1">
                                            {addressHistory.map((item, index) => (
                                                <li
                                                    key={index}
                                                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-accent rounded-md text-sm"
                                                    onClick={() => handleHistoryClick(item)}
                                                    onMouseDown={(e) => e.preventDefault()}
                                                >
                                                    <History className="w-4 h-4 mr-2 flex-shrink-0 text-muted-foreground" />
                                                    <span className="truncate">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    )}
                                </PopoverContent>
                                </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" className="w-full" disabled={totalLoading}>
                        {isSearching || isLoading ? (
                            <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            正在搜索...
                            </>
                        ) : (
                            <>
                            <Search className="mr-2 h-4 w-4" />
                            搜索
                            </>
                        )}
                        </Button>
                    </form>
                    </Form>
                </CardContent>
                </Card>
            ) : (
                <div className="space-y-2 m-2 md:m-0">
                    <StationDetails
                        stations={stations}
                        selectedStationIndex={selectedStationIndex}
                        onStationSelect={handleStationSelect}
                        routeDetails={routeDetails}
                        travelMode={travelMode}
                        onTravelModeChange={handleTravelModeChange}
                        userAddress={userAddress}
                        userCoordinates={userCoordinates}
                    />
                    <Button variant="outline" className="w-full" onClick={handleNewSearch}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        返回并开始新搜索
                    </Button>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
