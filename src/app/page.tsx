"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search, MapPin, Store } from "lucide-react";
import dynamic from 'next/dynamic';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { getNearestStations } from "@/app/actions";
import { StationInfoCard } from "@/components/station-info-card";
import { MeituanIcon } from "@/components/icons";
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from "@/components/ui/popover";
import type { FindNearestStationsOutput } from "@/ai/flows/find-nearest-stations";


const MapComponent = dynamic(
  () => import('@/components/map-placeholder').then((mod) => mod.MapComponent),
  { 
    ssr: false,
    loading: () => <div className="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden bg-muted border shadow-lg"><Skeleton className="absolute inset-0" /></div>
  }
);

const formSchema = z.object({
  address: z.string().min(5, {
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

interface AddressSuggestion {
  name: string;
  district: string;
}

export default function Home() {
  const { toast } = useToast();
  const [stations, setStations] = useState<FindNearestStationsOutput['stations']>([]);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStationIndex, setSelectedStationIndex] = useState<number | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<{latitude: number, longitude: number} | null>(null);

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [autoComplete, setAutoComplete] = useState<any>(null);
  const [geocoder, setGeocoder] = useState<any>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  });

  const addressValue = form.watch("address");

  useEffect(() => {
    const loadInitialData = async (address: string) => {
      setIsLoading(true);
      setUserAddress(address);
      form.setValue("address", address);

      // We need to geocode the default address as well
      const geocodePromise = new Promise<{latitude: number, longitude: number} | null>((resolve) => {
        const AMap = window.AMap;
        if (!geocoder) {
            // Geocoder might not be in state yet, but it's initialized.
            const tempGeocoder = new AMap.Geocoder({ city: '全国' });
            tempGeocoder.getLocation(address, (status: string, result: any) => {
              if (status === 'complete' && result.geocodes.length) {
                const { lat, lng } = result.geocodes[0].location;
                resolve({ latitude: lat, longitude: lng });
              } else {
                resolve(null);
              }
            });
            return;
        };

        geocoder.getLocation(address, (status: string, result: any) => {
          if (status === 'complete' && result.geocodes.length) {
            const { lat, lng } = result.geocodes[0].location;
            resolve({ latitude: lat, longitude: lng });
          } else {
            resolve(null);
          }
        });
      });
      
      const coords = await geocodePromise;

      if (coords) {
        setUserCoordinates(coords);
        const result = await getNearestStations(coords);
        if (result.error) {
          toast({ variant: "destructive", title: "错误", description: result.error });
        } else if (result.data) {
          setStations(result.data.stations);
        }
      } else {
        toast({ variant: "destructive", title: "错误", description: "无法解析默认地址的坐标。" });
      }

      setIsLoading(false);
    };

    import('@amap/amap-jsapi-loader').then(({ default: AMapLoader }) => {
        if (process.env.NEXT_PUBLIC_AMAP_KEY && process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE) {
            window._AMapSecurityConfig = {
                securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE,
            };
        }

        AMapLoader.load({
          key: process.env.NEXT_PUBLIC_AMAP_KEY || "",
          version: "2.0",
          plugins: ['AMap.AutoComplete', 'AMap.Geocoder'],
        })
          .then((AMap) => {
            setAutoComplete(new AMap.AutoComplete({ city: '全国' }));
            setGeocoder(new AMap.Geocoder({ city: '全国' }));
            loadInitialData("上海市黄浦区人民广场");
          })
          .catch((e) => {
            console.error("Failed to load AMap AutoComplete:", e);
            toast({
                variant: "destructive",
                title: "错误",
                description: "地址建议服务加载失败。",
            });
             setIsLoading(false);
          });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced effect for address suggestions
  useEffect(() => {
    if (!addressValue || addressValue.length < 2) {
      setSuggestions([]);
      setIsPopoverOpen(false);
      return;
    }

    const handler = setTimeout(() => {
      if (!autoComplete) return;
      autoComplete.search(addressValue, (status: string, result: any) => {
        if (status === 'complete' && result.tips) {
            const validSuggestions = result.tips.filter((tip: any) => tip.name && tip.district);
            if (validSuggestions.length > 0) {
                setSuggestions(validSuggestions.map((tip: any) => ({
                    name: tip.name,
                    district: tip.district,
                })));
                setIsPopoverOpen(true);
            } else {
                setSuggestions([]);
                setIsPopoverOpen(false);
            }
        } else {
          setSuggestions([]);
          setIsPopoverOpen(false);
        }
      });
    }, 500); // 500ms debounce delay

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
    setStations([]);
    setUserAddress(values.address);
    setSelectedStationIndex(null);
    setUserCoordinates(null);

    const geocodePromise = new Promise<{latitude: number, longitude: number} | null>((resolve, reject) => {
      geocoder.getLocation(values.address, (status: string, result: any) => {
        if (status === 'complete' && result.geocodes.length > 0) {
          const { lat, lng } = result.geocodes[0].location;
          resolve({ latitude: lat, longitude: lng });
        } else {
          reject(new Error("无法找到该地址的坐标。"));
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
          if (result.data.stations.length === 0) {
            toast({
                title: "未找到站点",
                description: "我们未能找到该地址附近的任何站点。",
            });
          }
        }
      }
    } catch(err: any) {
       toast({ variant: "destructive", title: "地址解析失败", description: err.message });
    } finally {
      setIsSearching(false);
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    form.setValue("address", suggestion, { shouldValidate: true });
    setSuggestions([]);
    setIsPopoverOpen(false);
    document.querySelector<HTMLInputElement>('input[name="address"]')?.focus();
  };


  const handleStationSelect = useCallback((index: number | null) => {
    setSelectedStationIndex(index);
  }, []);

  const totalLoading = isLoading || isSearching;

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MeituanIcon className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
              美团附近站点查询
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-[400px] xl:w-[450px] flex-shrink-0 flex flex-col gap-8">
            <Card className="w-full shadow-lg">
              <CardHeader>
                <CardTitle>查找附近站点</CardTitle>
                <CardDescription>输入您的地址，查找最近的三个美团站点。</CardDescription>
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
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                      placeholder="例如：北京市海淀区中关村"
                                      {...field}
                                      autoComplete="off"
                                      className="pl-10" />
                                  </div>
                                </FormControl>
                              </PopoverAnchor>
                              <PopoverContent 
                                align="start" 
                                className="w-[var(--radix-popover-anchor-width)] p-0"
                                onOpenAutoFocus={(e) => e.preventDefault()}
                              >
                                {suggestions.length > 0 && (
                                  <ul className="py-1">
                                    {suggestions.map((suggestion, index) => (
                                      <li
                                        key={index}
                                        className="px-3 py-2 cursor-pointer hover:bg-accent rounded-md"
                                        onClick={() => handleSuggestionClick(suggestion.district + suggestion.name)}
                                        onMouseDown={(e) => e.preventDefault()}
                                      >
                                        <div className="text-sm font-medium">{suggestion.name}</div>
                                        <div className="text-xs text-muted-foreground">{suggestion.district}</div>
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </PopoverContent>
                            </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={totalLoading}>
                      {totalLoading ? (
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

            <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">搜索结果</h2>
                {totalLoading && (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-grow space-y-2">
                                        <Skeleton className="h-5 w-3/4" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-1/2" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {!totalLoading && stations.length > 0 && (
                    <div className="space-y-4">
                        {stations.map((station, index) => (
                            <StationInfoCard
                                key={station.name}
                                station={station}
                                index={index}
                                isSelected={selectedStationIndex === index}
                                onClick={() => handleStationSelect(index === selectedStationIndex ? null : index)}
                            />
                        ))}
                    </div>
                )}

                {!totalLoading && stations.length === 0 && (
                     <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                        <CardContent className="p-0">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Store className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">
                                {userAddress && !isLoading ? "未找到站点。" : "您的搜索结果将显示在此处。"}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
          </div>

          <div className="flex-1 h-[50vh] lg:h-[calc(100vh-8rem)] lg:sticky top-24">
            <MapComponent
              stations={stations}
              userCoordinates={userCoordinates}
              selectedStationIndex={selectedStationIndex}
              onStationSelect={handleStationSelect}
              userAddress={userAddress}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
