"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PurchaseSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get("plan");

  useEffect(() => {
    if (plan) {
      try {
        localStorage.setItem('hasEverPaid', 'true'); // Mark that the user has paid

        if (plan === "pro-monthly") {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          localStorage.setItem("proAccessExpiry", expiryDate.toISOString());
          localStorage.removeItem("pdfAnalysisCount"); // Pro plan makes free tier irrelevant
        } else if (plan === "pay-per-pdf") {
          const currentCredits = parseInt(localStorage.getItem("pdfCredits") || "0");
          localStorage.setItem("pdfCredits", (currentCredits + 1).toString());
          // We do not remove pdfAnalysisCount, the free credit is separate
        }
      } catch (error) {
        console.error("Could not access localStorage:", error);
      }
    }

    const timer = setTimeout(() => {
      router.push("/");
    }, 500);

    return () => clearTimeout(timer);
  }, [plan, router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h1 className="mt-4 text-xl font-semibold">Finalizing your purchase...</h1>
      <p className="text-muted-foreground">You will be redirected shortly.</p>
    </div>
  );
}
