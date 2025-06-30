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

export default function Home() {
  const { toast } = useToast();
  const [stations, setStations] = useState<FindNearestStationsOutput['stations']>([]);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStationIndex, setSelectedStationIndex] = useState<number | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<{latitude: number, longitude: number} | null>(null);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [autoComplete, setAutoComplete] = useState<any>(null);


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  });

  useEffect(() => {
    const loadDefaultStations = async () => {
      setIsLoading(true);
      const defaultAddress = "上海市黄浦区人民广场";
      setUserAddress(defaultAddress);

      const result = await getNearestStations(defaultAddress);

      if (result.error) {
        toast({ variant: "destructive", title: "错误", description: result.error });
      } else if (result.data) {
        setStations(result.data.stations);
        setUserCoordinates(result.data.userCoordinates);
      }
      setIsLoading(false);
    };

    loadDefaultStations();

    import('@amap/amap-jsapi-loader').then(({ default: AMapLoader }) => {
        if (process.env.NEXT_PUBLIC_AMAP_KEY && process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE) {
            window._AMapSecurityConfig = {
                securityJsCode: process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE,
            };
        }

        AMapLoader.load({
          key: process.env.NEXT_PUBLIC_AMAP_KEY || "",
          version: "2.0",
          plugins: ['AMap.AutoComplete'],
        })
          .then((AMap) => {
            setAutoComplete(new AMap.AutoComplete({ city: '全国' }));
          })
          .catch((e) => {
            console.error("Failed to load AMap AutoComplete:", e);
            toast({
                variant: "destructive",
                title: "错误",
                description: "地址建议服务加载失败。",
            });
          });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsPopoverOpen(false);
    setIsLoading(true);
    setStations([]);
    setUserAddress(values.address);
    setSelectedStationIndex(null);
    setUserCoordinates(null);

    const result = await getNearestStations(values.address);

    setIsLoading(false);

    if (result.error) {
      toast({ variant: "destructive", title: "错误", description: result.error });
    } else if (result.data) {
      setStations(result.data.stations);
      setUserCoordinates(result.data.userCoordinates);
      if (result.data.stations.length === 0) {
        toast({
            title: "未找到站点",
            description: "我们未能找到该地址附近的任何站点。",
        });
      }
    }
  }

  const handleAddressChange = (value: string) => {
    form.setValue("address", value);
    
    if (!autoComplete || value.length < 2) {
      setSuggestions([]);
      setIsPopoverOpen(false);
      return;
    }

    setIsSuggesting(true);
    autoComplete.search(value, (status: string, result: any) => {
      setIsSuggesting(false);
      if (status === 'complete' && result.tips && result.tips.length > 0) {
        const newSuggestions = result.tips.map((tip: any) => tip.name);
        setSuggestions(newSuggestions);
        setIsPopoverOpen(true);
      } else {
        setSuggestions([]);
        setIsPopoverOpen(false);
      }
    });
  };

  const handleSuggestionClick = (suggestion: string) => {
    form.setValue("address", suggestion, { shouldValidate: true });
    setSuggestions([]);
    setIsPopoverOpen(false);
    form.handleSubmit(onSubmit)();
  };


  const handleStationSelect = useCallback((index: number | null) => {
    setSelectedStationIndex(index);
  }, []);

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
                                      onChange={(e) => {
                                        field.onChange(e);
                                        handleAddressChange(e.target.value);
                                      }}
                                      autoComplete="off"
                                      className="pl-10" />
                                    {isSuggesting && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin" />}
                                  </div>
                                </FormControl>
                              </PopoverAnchor>
                              <PopoverContent align="start" className="w-[var(--radix-popover-anchor-width)] p-0">
                                {suggestions.length > 0 && (
                                  <ul className="py-1">
                                    {suggestions.map((suggestion, index) => (
                                      <li
                                        key={index}
                                        className="px-3 py-2 text-sm cursor-pointer hover:bg-accent rounded-md"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        onMouseDown={(e) => e.preventDefault()}
                                      >
                                        {suggestion}
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && !isSuggesting ? (
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
                {isLoading && (
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

                {!isLoading && stations.length > 0 && (
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

                {!isLoading && stations.length === 0 && (
                     <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed">
                        <CardContent className="p-0">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                <Store className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground">
                                {userAddress ? "未找到站点。" : "您的搜索结果将显示在此处。"}
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
