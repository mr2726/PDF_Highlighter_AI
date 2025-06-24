import React, { Suspense } from "react";
import PurchaseSuccessClient from "./PurchaseSuccessClient";

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PurchaseSuccessClient />
    </Suspense>
  );
}
