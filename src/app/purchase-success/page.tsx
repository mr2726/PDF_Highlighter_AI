import React, { Suspense } from "react";
import PurchaseSuccessClient from "./PurchaseSuccessClient";

export default function PurchaseSuccessPage() {
<<<<<<< HEAD
=======
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan');

  useEffect(() => {
    if (plan) {
      try {
        localStorage.setItem('hasEverPaid', 'true'); // Mark that the user has paid

        if (plan === 'pro-monthly') {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          localStorage.setItem('proAccessExpiry', expiryDate.toISOString());
          localStorage.removeItem('pdfAnalysisCount'); // Pro plan makes free tier irrelevant
        } else if (plan === 'pay-per-pdf') {
          const currentCredits = parseInt(localStorage.getItem('pdfCredits') || '0');
          localStorage.setItem('pdfCredits', (currentCredits + 1).toString());
          // We do not remove pdfAnalysisCount, the free credit is separate
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

>>>>>>> 152e0ca (И так Оплата почти работает!)
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PurchaseSuccessClient />
    </Suspense>
  );
}
