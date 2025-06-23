"use client";

import React, { useState, useCallback, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useToast } from "@/hooks/use-toast";
import { analyzePdf } from '@/app/actions';
import { findHighlights, createHighlightedPdf } from '@/lib/pdf-utils';
import type { Highlight } from '@/lib/pdf-utils';
import type { KeyPointExtractionOutput } from '@/ai/flows/key-point-extraction';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Upload, Download, Loader2, FileText, Lightbulb, ChevronLeft, ChevronRight, Search } from 'lucide-react';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

export default function PdfHighlighter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<KeyPointExtractionOutput | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const { toast } = useToast();

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

  const handleAnalyze = async () => {
    if (!pdfFile) return;
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(pdfFile);
      reader.onload = async () => {
        const pdfDataUri = reader.result as string;
        try {
          const result = await analyzePdf({ pdfDataUri });
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
      reader.onerror = () => {
        setIsLoading(false);
        toast({ variant: 'destructive', title: 'File Read Error', description: 'Could not read the PDF file.' });
      };
    } catch (e) {
      setIsLoading(false);
      toast({ variant: 'destructive', title: 'Error', description: 'An unexpected error occurred.' });
    }
  };

  const handleDownload = async () => {
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
    return highlights.find(h => h.pageIndex === currentPage - 1)?.rects || [];
  }, [highlights, currentPage]);

  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, numPages));

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline text-primary">PDF Highlighter AI</h1>
        <p className="text-muted-foreground mt-2">Upload a PDF and let AI summarize and highlight key points for you.</p>
      </header>

      {!pdfFile ? (
        <Card className="max-w-xl mx-auto border-dashed border-2 hover:border-primary transition-colors">
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Upload className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">Drag & drop a PDF file</h3>
              <p className="text-muted-foreground">or click to select a file from your computer</p>
            </CardContent>
          </label>
          <input id="pdf-upload" type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="truncate max-w-xs md:max-w-md">{pdfFile.name}</CardTitle>
                <div className="flex gap-2">
                  <Button onClick={handleAnalyze} disabled={isLoading}>
                    {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
                    {aiResult ? 'Re-Analyze' : 'Analyze'}
                  </Button>
                  <Button onClick={handleDownload} disabled={!aiResult || isLoading} variant="outline">
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
                        <Page pageNumber={currentPage} scale={1.5} />
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
