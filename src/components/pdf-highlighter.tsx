"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Document, Page, pdfjs } from 'react-pdf';
import { useToast } from "@/hooks/use-toast";
import { analyzePdf } from '@/app/actions';
import { findHighlights, createHighlightedPdf, extractTextFromPdf } from '@/lib/pdf-utils';
import type { Highlight } from '@/lib/pdf-utils';
import type { KeyPointExtractionOutput } from '@/ai/flows/key-point-extraction';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Upload, Download, Loader2, FileText, Lightbulb, ChevronLeft, ChevronRight, Check } from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PDF_SCALE = 1.5;

type UserAccess = {
  isPro: boolean;
  credits: number;
  hasEverPaid: boolean;
};

export default function PdfHighlighter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<KeyPointExtractionOutput | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const { toast } = useToast();
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [userAccess, setUserAccess] = useState<UserAccess>({ isPro: false, credits: 0, hasEverPaid: false });
  const [redirectUrlBase, setRedirectUrlBase] = useState('');
  
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    setRedirectUrlBase(window.location.origin);
  }, []);

  useEffect(() => {
    const hasPurchaseSucceeded = searchParams.get('purchase') === 'success';
    const plan = searchParams.get('plan');
    let purchaseHandled = false;

    // --- Logic to handle successful purchase ---
    if (hasPurchaseSucceeded && plan) {
      try {
        localStorage.setItem('hasEverPaid', 'true'); // Mark that the user has paid

        if (plan === "pro-monthly") {
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 30);
          localStorage.setItem("proAccessExpiry", expiryDate.toISOString());
          localStorage.removeItem("pdfCredits"); // Pro users don't use credits
        } else if (plan === "pay-per-pdf") {
          const currentCredits = parseInt(localStorage.getItem("pdfCredits") || "0", 10);
          localStorage.setItem("pdfCredits", (currentCredits + 1).toString());
        }
        purchaseHandled = true;
      } catch (error) {
        console.error("Could not access localStorage during purchase update:", error);
      }
    }
    
    // --- Logic to check current access rights ---
    try {
      const expiry = localStorage.getItem('proAccessExpiry');
      let isPro = false;
      if (expiry && new Date(expiry) > new Date()) {
        isPro = true;
      } else if (expiry) {
        localStorage.removeItem('proAccessExpiry');
      }

      const hasEverPaid = localStorage.getItem('hasEverPaid') === 'true';
      let credits = parseInt(localStorage.getItem('pdfCredits') || '0', 10);

      // Grant a one-time free credit ONLY to genuinely new users
      if (!hasEverPaid && localStorage.getItem('pdfCredits') === null) {
        credits = 1;
        localStorage.setItem('pdfCredits', '1');
      }

      setUserAccess({
        isPro,
        credits: isPro ? Infinity : credits,
        hasEverPaid,
      });

    } catch (error) {
      console.warn("Could not access localStorage for access check:", error);
      setUserAccess({ isPro: false, credits: 0, hasEverPaid: false });
    }

    // --- Clean the URL if a purchase was just processed ---
    if (purchaseHandled) {
      // Use replace to avoid adding to history, so back button works as expected
      router.replace('/'); 
    }
  }, [searchParams, router]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      setAiResult(null);
      setHighlights([]);
      setNumPages(0);
      setCurrentPage(1);
    } else {
      toast({ variant: 'destructive', title: 'Invalid File', description: 'Please upload a valid PDF file.' });
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const runAnalysis = async () => {
    if (!pdfFile) return;
    setIsLoading(true);
    setAiResult(null);
    setHighlights([]);
    try {
      const documentText = await extractTextFromPdf(pdfFile);
      if (!documentText.trim()) {
        throw new Error("Could not extract any text from the PDF. It might be an image-only PDF.");
      }
      const result = await analyzePdf({ documentText });
      setAiResult(result);
      toast({ title: 'Analysis Complete', description: 'Summary and key points generated.' });
      const highlightData = await findHighlights(pdfFile, result.keyPoints);
      setHighlights(highlightData);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Analysis Failed', description: (e as Error).message });
      setAiResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!pdfFile) return;

    const { isPro, credits } = userAccess;

    if (isPro || credits > 0) {
      // For non-pro users, decrement a credit
      if (!isPro) {
        try {
          const newCredits = credits - 1;
          localStorage.setItem('pdfCredits', newCredits.toString());
          setUserAccess(prev => ({ ...prev, credits: newCredits }));
        } catch (error) { 
          console.warn("Could not write to localStorage:", error);
        }
      }
      await runAnalysis();
    } else {
      // No access, show upgrade dialog
      setShowUpgradeDialog(true);
    }
  };

  const handleDownload = async () => {
    const { isPro, hasEverPaid } = userAccess;
    
    // Download is a paid feature. It requires a Pro plan or having ever purchased credits.
    if (!isPro && !hasEverPaid) {
        toast({ variant: "destructive", title: "Upgrade to Download", description: "Downloading highlighted PDFs is a premium feature." });
        setShowUpgradeDialog(true);
        return;
    }

    if (!pdfFile || highlights.length === 0) {
      toast({ variant: "destructive", title: "Nothing to download", description: "Please analyze a PDF first." });
      return;
    }

    toast({ title: "Preparing Download", description: "Generating highlighted PDF..." });
    try {
      const highlightedPdfBytes = await createHighlightedPdf(pdfFile, highlights);
      const blob = new Blob([highlightedPdfBytes], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `highlighted-${pdfFile.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      toast({ variant: "destructive", title: "Download Failed", description: "Could not generate the highlighted PDF." });
    }
  };

  const currentHighlights = useMemo(() => {
    const pageHighlights = highlights.find(h => h.pageIndex === currentPage - 1);
    if (!pageHighlights) return [];
  
    return pageHighlights.rects.map(rect => ({
      ...rect,
      left: rect.left * PDF_SCALE,
      top: rect.top * PDF_SCALE,
      width: rect.width * PDF_SCALE,
      height: rect.height * PDF_SCALE,
    }));
  }, [highlights, currentPage]);

  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages));

  const proMonthlyUrl = redirectUrlBase ? `https://casperdevstore.lemonsqueezy.com/buy/324f3c3c-26b9-469e-b60e-fd9471c75639?media=0&logo=0&desc=0&discount=0&redirect_url=${redirectUrlBase}/?purchase=success&plan=pro-monthly` : '#';
  const payPerPdfUrl = redirectUrlBase ? `https://casperdevstore.lemonsqueezy.com/buy/5a6bf639-dcb3-437b-aa9e-fef2008c81ac?media=0&logo=0&desc=0&discount=0&redirect_url=${redirectUrlBase}/?purchase=success&plan=pay-per-pdf` : '#';
  
  const canDownload = userAccess.isPro || userAccess.hasEverPaid;

  return (
    <div className="container mx-auto p-4 md:p-8">
      <AlertDialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upgrade Required</AlertDialogTitle>
            <AlertDialogDescription>
              You have {userAccess.credits} credit(s) remaining. Please purchase more credits or subscribe for unlimited access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href="/pricing">View Pricing</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline text-primary">PDF Highlighter AI</h1>
        <p className="text-muted-foreground mt-2">Upload a PDF and let AI summarize and highlight key points for you.</p>
      </header>

      {!pdfFile ? (
        <div className="flex flex-col items-center">
            <Card className="w-full max-w-xl border-dashed border-2 hover:border-primary transition-colors">
            <label htmlFor="pdf-upload" className="cursor-pointer">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Upload className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold">Drag & drop a PDF file</h3>
                <p className="text-muted-foreground">or click to select a file from your computer</p>
                </CardContent>
            </label>
            <input id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </Card>

            <section className="w-full pt-16 pb-8">
                <div className="container px-0">
                    <div className="mx-auto max-w-3xl text-center mb-12">
                        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Simple, transparent pricing</h2>
                        <p className="mt-4 text-muted-foreground md:text-xl">
                            Choose the plan that's right for you. Get started for free.
                        </p>
                    </div>
                    <div className="grid items-start gap-6 lg:grid-cols-3 lg:gap-10">
                    <Card className="flex flex-col h-full">
                        <CardHeader>
                            <CardTitle>Free</CardTitle>
                            <CardDescription>For light users and to try out our service.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">$0</span>
                            <span className="text-sm text-muted-foreground">/ forever</span>
                            </div>
                            <Separator className="my-4" />
                            <ul className="grid gap-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                Analyze 1 PDF document for free
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                AI-powered summary
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                Key point highlighting
                            </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full" variant="outline" onClick={() => document.getElementById('pdf-upload')?.click()}>
                                Get Started
                            </Button>
                        </CardFooter>
                        </Card>
                        
                        <Card className="flex flex-col h-full border-primary shadow-lg relative">
                        <div className="absolute top-0 right-4 -mt-3">
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground">
                                Most Popular
                            </div>
                            </div>
                        <CardHeader>
                            <CardTitle>Pro Monthly</CardTitle>
                            <CardDescription>For power users who need unlimited access.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">$10</span>
                            <span className="text-sm text-muted-foreground">/ month</span>
                            </div>
                            <Separator className="my-4" />
                            <ul className="grid gap-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                Unlimited PDF analyses
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                AI-powered summaries
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                Key point highlighting
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                Download highlighted PDFs
                            </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full" disabled={!redirectUrlBase}>
                            <a href={proMonthlyUrl}>
                                Subscribe Now
                            </a>
                            </Button>
                        </CardFooter>
                        </Card>
                        
                        <Card className="flex flex-col h-full">
                        <CardHeader>
                            <CardTitle>Pay Per PDF</CardTitle>
                            <CardDescription>For occasional use without a subscription.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-bold">$3</span>
                            <span className="text-sm text-muted-foreground">/ per PDF</span>
                            </div>
                            <Separator className="my-4" />
                            <ul className="grid gap-2 text-sm">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                Pay only for what you use
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                AI-powered summaries
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                Key point highlighting
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-primary" />
                                Download highlighted PDFs
                            </li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button asChild className="w-full" variant="secondary" disabled={!redirectUrlBase}>
                            <a href={payPerPdfUrl}>
                                Buy Now
                            </a>
                            </Button>
                        </CardFooter>
                        </Card>
                    </div>
                </div>
            </section>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="truncate max-w-xs md:max-w-md">{pdfFile.name}</CardTitle>
                <div className="flex items-center gap-2">
                    <Link href="/pricing" passHref>
                      <Button variant="ghost" size="sm">Pricing</Button>
                    </Link>
                    <Separator orientation="vertical" className="h-6" />
                    <Button onClick={handleAnalyze} disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                      {aiResult ? 'Re-Analyze' : 'Analyze'}
                    </Button>
                    <Button onClick={handleDownload} disabled={!aiResult || isLoading || !canDownload} variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative bg-secondary/30 rounded-lg p-2">
                  {isLoading && (
                     <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center z-20 rounded-lg">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <p className="text-lg font-medium">AI is analyzing your document...</p>
                        <p className="text-muted-foreground">This may take a moment.</p>
                    </div>
                  )}
                  <ScrollArea className="h-[70vh]">
                    <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess} loading={<div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                      <div className="relative">
                        <Page pageNumber={currentPage} scale={PDF_SCALE} />
                        {currentHighlights.map((rect, i) => (
                           <div
                             key={i}
                             className="absolute bg-accent/40 rounded-sm animate-in fade-in"
                             style={{
                               left: `${rect.left}px`,
                               top: `${rect.top}px`,
                               width: `${rect.width}px`,
                               height: `${rect.height}px`,
                             }}
                           />
                         ))}
                      </div>
                    </Document>
                  </ScrollArea>
                </div>
                {numPages > 0 && (
                  <div className="flex items-center justify-center mt-4 gap-4">
                    <Button variant="outline" size="icon" onClick={goToPrevPage} disabled={currentPage <= 1} aria-label="Previous Page">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium">Page {currentPage} of {numPages}</span>
                    <Button variant="outline" size="icon" onClick={goToNextPage} disabled={currentPage >= numPages} aria-label="Next Page">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-1">
             <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>Summary and key points from the document.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && !aiResult && (
                  <div className="space-y-4">
                      <div className="space-y-2">
                         <h3 className="text-lg font-semibold">Summary</h3>
                         <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-muted rounded w-5/6 animate-pulse"></div>
                            <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                         </div>
                      </div>
                      <Separator/>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Key Points</h3>
                         <div className="space-y-2">
                            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                            <div className="h-4 bg-muted rounded w-4/5 animate-pulse"></div>
                         </div>
                      </div>
                  </div>
                )}
                {aiResult ? (
                  <ScrollArea className="h-[60vh] pr-4">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Summary</h3>
                        <p className="text-sm text-muted-foreground">{aiResult.summary}</p>
                      </div>
                      <Separator />
                      <div>
                        <h3 className="font-semibold text-lg mb-2">Key Points</h3>
                        <ul className="space-y-2">
                          {aiResult.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <Lightbulb className="h-4 w-4 text-accent flex-shrink-0 mt-1" />
                              <span className="text-muted-foreground">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  !isLoading && (
                    <div className="text-center text-muted-foreground py-10">
                      <FileText className="mx-auto h-12 w-12 mb-4" />
                      <p>Analysis results will appear here once you analyze a PDF.</p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
