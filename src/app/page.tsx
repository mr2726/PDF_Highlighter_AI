'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import Faq from '@/components/faq';
import Testimonials from '@/components/testimonials';

const PdfHighlighter = dynamic(() => import('@/components/pdf-highlighter'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-20rem)] items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PdfHighlighter />
      <Testimonials />
      <Faq />
    </main>
  );
}
