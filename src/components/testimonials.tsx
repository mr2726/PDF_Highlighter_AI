"use client";

import { Star } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    quote: "This tool is a lifesaver. I used to spend hours sifting through research papers. Now, I can get the key points in minutes. It's completely changed my workflow.",
    name: "Dr. Jane Doe",
    title: "University Researcher",
  },
  {
    quote: "As a law student, I'm buried in reading. PDF Highlighter AI helps me quickly identify crucial arguments and precedents. It's an indispensable study aid.",
    name: "Michael Smith",
    title: "Law Student",
  },
  {
    quote: "Brilliant! I use it to get summaries of business reports before big meetings. It gives me a huge advantage and saves me so much time. Highly recommended.",
    name: "Alice Chen",
    title: "Product Manager",
  },
  {
    quote: "I was skeptical about an AI reading my financial reports, but the accuracy of the key points is astonishing. It helps me prepare for client meetings much faster.",
    name: "David Lee",
    title: "Financial Analyst",
  },
  {
    quote: "Finally, a tool that understands academic jargon! It pulls out the exact theses and supporting evidence I need. A must-have for any post-grad student.",
    name: "Dr. Emily Carter",
    title: "History Professor",
  }
];

export default function Testimonials() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-3xl font-bold tracking-tighter sm:text-4xl">What Our Users Say</h2>
          <p className="mt-4 text-center text-muted-foreground md:text-xl">
            Hear from students, researchers, and professionals who have saved time with our tool.
          </p>
        </div>
      </div>
      <div className="relative mt-12 w-full overflow-hidden before:absolute before:left-0 before:top-0 before:z-10 before:h-full before:w-20 before:bg-gradient-to-r before:from-background before:to-transparent after:absolute after:right-0 after:top-0 after:z-10 after:h-full after:w-20 after:bg-gradient-to-l after:from-background after:to-transparent">
        <div className="flex animate-marquee hover:[animation-play-state:paused]">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <Card key={index} className="mx-4 flex-shrink-0 w-80 md:w-96">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-5 w-5 fill-primary text-primary" />)}
                </div>
                <blockquote className="text-sm text-muted-foreground flex-grow">
                  "{testimonial.quote}"
                </blockquote>
                <div className="mt-4">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.title}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
