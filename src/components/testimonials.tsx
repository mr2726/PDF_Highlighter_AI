import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

export default function Testimonials() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">What Our Users Say</h2>
          <p className="mt-4 text-muted-foreground md:text-xl">
            Hear from students, researchers, and professionals who have saved time with our tool.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8 mt-12">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="woman portrait" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    "This tool is a lifesaver. I used to spend hours sifting through research papers. Now, I can get the key points in minutes. It's completely changed my workflow."
                  </p>
                  <div className="mt-4 font-semibold">Dr. Jane Doe</div>
                  <div className="text-xs text-muted-foreground">University Researcher</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="man portrait" />
                  <AvatarFallback>MS</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    "As a law student, I'm buried in reading. PDF Highlighter AI helps me quickly identify crucial arguments and precedents. It's an indispensable study aid."
                  </p>
                  <div className="mt-4 font-semibold">Michael Smith</div>
                  <div className="text-xs text-muted-foreground">Law Student</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src="https://placehold.co/40x40.png" data-ai-hint="woman face" />
                  <AvatarFallback>AC</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    "Brilliant! I use it to get summaries of business reports before big meetings. It gives me a huge advantage and saves me so much time. Highly recommended."
                  </p>
                  <div className="mt-4 font-semibold">Alice Chen</div>
                  <div className="text-xs text-muted-foreground">Product Manager</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
