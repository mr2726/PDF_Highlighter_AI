'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const PdfHighlighter = dynamic(() => import('@/components/pdf-highlighter'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <PdfHighlighter />
    </main>
  );
}
