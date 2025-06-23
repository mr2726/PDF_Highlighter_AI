import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function Faq() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-muted-foreground md:text-xl">
            Have questions? We have answers. If you can't find what you're looking for, feel free to contact us.
          </p>
        </div>
        <div className="mx-auto max-w-3xl mt-12">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Is my data secure?</AccordionTrigger>
              <AccordionContent>
                Absolutely. We prioritize your privacy and security. Your documents are processed securely and are not stored on our servers after the analysis is complete. All connections are encrypted.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What kind of PDFs can I analyze?</AccordionTrigger>
              <AccordionContent>
                Our AI works best with text-based PDF documents. This includes most articles, reports, and digital books. At the moment, we do not support PDFs that are composed entirely of scanned images or handwritten text.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>What happens after I use my one free analysis?</AccordionTrigger>
              <AccordionContent>
                The free plan is a great way to try our service. After you've analyzed your first document, you can upgrade to one of our flexible paid plans to continue analyzing unlimited documents, or pay as you go.
              </AccordionContent>
            </AccordionItem>
             <AccordionItem value="item-4">
              <AccordionTrigger>Can I download the highlighted PDF?</AccordionTrigger>
              <AccordionContent>
                Yes! The ability to download your highlighted PDF is a feature available on our "Pro Monthly" and "Pay Per PDF" plans. This allows you to keep a permanent, marked-up copy of your document.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}
