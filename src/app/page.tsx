"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Search, MapPin, Phone, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { getNearestStations } from "@/app/actions";
import { MapPlaceholder } from "@/components/map-placeholder";
import { StationInfoCard } from "@/components/station-info-card";
import { MeituanIcon } from "@/components/icons";
import type { FindNearestStationsOutput } from "@/ai/flows/find-nearest-stations";


const formSchema = z.object({
  address: z.string().min(5, {
    message: "Please enter a more specific address.",
  }),
});

export default function Home() {
  const { toast } = useToast();
  const [stations, setStations] = useState<FindNearestStationsOutput>([]);
  const [userAddress, setUserAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStationIndex, setSelectedStationIndex] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setStations([]);
    setUserAddress(values.address);
    setSelectedStationIndex(null);

    const result = await getNearestStations(values.address);

    if (result.error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    } else if (result.data) {
      setStations(result.data);
      if (result.data.length === 0) {
        toast({
            title: "No stations found",
            description: "We couldn't find any stations near that address.",
        });
      }
    }
    setIsLoading(false);
  }

  const handleStationSelect = (index: number | null) => {
    setSelectedStationIndex(index);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MeituanIcon className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">
              Meituan Nearby Locator
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 flex flex-col gap-8">
            <Card className="w-full shadow-lg">
              <CardHeader>
                <CardTitle>Find Nearby Stations</CardTitle>
                <CardDescription>Enter an address to find the three nearest Meituan stations.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                              <Input placeholder="e.g., 123 Main St, Anytown, USA" {...field} className="pl-10" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          Search
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold tracking-tight">Results</h2>
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
                                {userAddress ? "No stations found." : "Your results will appear here."}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
          </div>

          <div className="lg:col-span-2 sticky top-24">
            <MapPlaceholder
              stations={stations}
              userAddress={userAddress}
              selectedStationIndex={selectedStationIndex}
              onStationSelect={handleStationSelect}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
