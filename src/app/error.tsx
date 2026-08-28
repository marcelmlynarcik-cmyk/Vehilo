"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Něco se nepovedlo</CardTitle>
          <CardDescription>
            Aplikace narazila na chybu při načítání. Zkuste stránku načíst znovu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button type="button" onClick={() => unstable_retry()}>
            <RotateCcw aria-hidden="true" />
            Zkusit znovu
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
