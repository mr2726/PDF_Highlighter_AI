'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function PurchaseSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  useEffect(() => {
    if (plan) {
      try {
        if (plan === 'pro-monthly') {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          localStorage.setItem('proAccessExpiry', expiryDate.toISOString());
          localStorage.removeItem('pdfAnalysisCount');
        } else if (plan === 'pay-per-pdf') {
          const currentCredits = parseInt(localStorage.getItem('pdfCredits') || '0');
          localStorage.setItem('pdfCredits', (currentCredits + 1).toString());
          localStorage.removeItem('pdfAnalysisCount');
        }
      } catch (error) {
        console.error("Could not access localStorage:", error);
      }
    }
    
    const timer = setTimeout(() => {
      router.push('/');
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
