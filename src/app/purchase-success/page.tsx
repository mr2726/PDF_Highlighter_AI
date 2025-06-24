import React, { Suspense } from "react";
import PurchaseSuccessClient from "./PurchaseSuccessClient";

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full flex-col items-center justify-center bg-background"><h1 className="text-xl font-semibold">Loading...</h1></div>}>
      <PurchaseSuccessClient />
    </Suspense>
  );
}
