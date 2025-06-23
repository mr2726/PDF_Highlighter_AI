import Link from 'next/link';
import { Check, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="container mx-auto px-4 lg:px-6 h-16 flex items-center border-b">
        <Link href="/" className="flex items-center justify-center gap-2">
           <FileText className="h-6 w-6 text-primary" />
          <span className="font-semibold">PDF Highlighter AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
            Analyzer
          </Link>
        </nav>
      </header>
      <main className="flex-grow">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Simple, transparent pricing</h1>
              <p className="mt-4 text-muted-foreground md:text-xl">
                Choose the plan that's right for you. Get started for free.
              </p>
            </div>
          </div>
        </section>
        <section className="w-full pb-12 md:pb-24 lg:pb-32">
          <div className="container grid items-start gap-6 px-4 md:px-6 lg:grid-cols-3 lg:gap-10">
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
                    Analyze 1 PDF document
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
                <Button asChild className="w-full" variant="outline">
                  <Link href="/">Get Started</Link>
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
                <Button asChild className="w-full">
                  <a href="https://your-store.lemonsqueezy.com/buy/pro-monthly-variant-id" target="_blank" rel="noopener noreferrer">
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
                <Button asChild className="w-full" variant="secondary">
                  <a href="https://your-store.lemonsqueezy.com/buy/per-pdf-variant-id" target="_blank" rel="noopener noreferrer">
                    Buy Now
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
        <section className="w-full pb-12 md:pb-24 lg:pb-32">
            <div className="container px-4 md:px-6 text-center">
                 <p className="text-sm text-muted-foreground">
                    Payments are securely handled by LemonSqueezy.
                </p>
            </div>
        </section>
      </main>
    </div>
  );
}
