"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { Map } from "lucide-react";
import { Card } from "@/components/ui/card";

const SyriaMap = dynamic(
  () => import("@/components/ui/syria-map").then((module) => module.SyriaMap),
  {
    ssr: false,
    loading: () => <SyriaMapPlaceholder />,
  },
);

interface LazySyriaMapProps {
  govCounts?: unknown;
}

export function LazySyriaMap({ govCounts }: LazySyriaMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || shouldLoad) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "420px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? <SyriaMap govCounts={govCounts} /> : <SyriaMapPlaceholder />}
    </div>
  );
}

function SyriaMapPlaceholder() {
  return (
    <Card className="min-h-[280px] p-6 bg-card/60 border-border/40 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
        <Map className="h-8 w-8 text-primary/70" />
        <div>
          <p className="text-sm font-semibold text-foreground">Interactive map loads on demand</p>
          <p className="mt-1 text-xs">The heavy map iframe is delayed until this section is near the viewport.</p>
        </div>
      </div>
    </Card>
  );
}
