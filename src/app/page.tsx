import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf, Sprout, TrendingUp, Languages, Map as MapIcon, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-farm');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold tracking-tight font-headline">YieldIQ</span>
          </div>
          <nav className="hidden md:flex gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
            <Link href="#impact" className="text-sm font-medium hover:text-primary transition-colors">Impact</Link>
            <Link href="#about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/dashboard">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-background">
          {/* Subtle animated background gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-green-400 to-emerald-600 blur-[100px] rounded-full mix-blend-multiply animate-pulse" style={{ animationDuration: '8s' }} />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-1000 zoom-in-95">
                <div className="inline-flex items-center rounded-full border border-primary/20 px-3 py-1 text-xs font-bold transition-all hover:bg-primary/10 hover:border-primary/40 bg-primary/5 text-primary tracking-wide shadow-sm">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
                  Powered by Google AI & Firebase
                </div>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter font-headline text-foreground leading-[1.1]">
                  Command Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-600">
                    Harvest.
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-[600px] leading-relaxed font-medium">
                  The supreme precision agriculture platform. High-accuracy yield predictions, 
                  resource optimization, and expert advisory right in your pocket.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5" asChild>
                    <Link href="/dashboard">Start Free Trial</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-xl border-border/60 hover:bg-muted/50 transition-all">
                    Watch Demo
                  </Button>
                </div>
                

              </div>
              
              <div className="relative animate-in slide-in-from-right-12 duration-1000 delay-200">
                 <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent rounded-[2rem] blur-3xl transform translate-x-4 translate-y-4" />
                 <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 ring-1 ring-border/50 bg-card">
                   <Image
                     src={heroImage?.imageUrl || "https://picsum.photos/seed/farm1/800/800"}
                     alt="YieldIQ Smart Farm"
                     fill
                     className="object-cover hover:scale-105 transition-transform duration-1000"
                     priority
                   />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                   
                   {/* Floating Glass UI Card */}
                   <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-white/10 dark:bg-black/40 border border-white/20 rounded-xl p-4 flex items-center justify-between shadow-2xl">
                      <div>
                         <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Live Telemetry</p>
                         <p className="text-white font-black text-lg">North Field Matrix</p>
                      </div>
                      <div className="bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold text-sm shadow-inner flex items-center gap-2">
                         <TrendingUp className="h-4 w-4" /> 98% Optimal
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bento Grid Section */}
        <section id="features" className="py-32 relative">
          <div className="absolute inset-0 bg-secondary/20 skew-y-3 transform origin-bottom-left -z-10" />
          
          <div className="container mx-auto px-4">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter font-headline">Enterprise Intelligence,<br/>Built for Every Farmer.</h2>
              <p className="text-lg text-muted-foreground max-w-[700px] mx-auto font-medium">
                We've combined Vertex AI, multi-spectral satellite imagery, and localized agronomy into a single, beautiful dashboard.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[250px]">
               {/* Big Card 1 - Spans 2 cols */}
               <div className="md:col-span-2 group relative overflow-hidden bg-card rounded-[2rem] border border-border/50 shadow-sm hover:shadow-xl transition-all p-8 flex flex-col justify-end">
                  <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity group-hover:scale-110 duration-500">
                     <TrendingUp className="w-48 h-48 text-primary" />
                  </div>
                  <div className="relative z-10">
                     <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                       <TrendingUp className="h-6 w-6 text-primary" />
                     </div>
                     <h3 className="text-2xl font-black mb-2 font-headline">AI Yield Prediction Network</h3>
                     <p className="text-muted-foreground font-medium max-w-md bg-background/50 backdrop-blur-sm rounded-lg p-1">
                       Utilize Vertex AI to predict crop yields with stunning accuracy based on decadal historical data and real-time sensory inputs.
                     </p>
                  </div>
               </div>

               {/* Tall Card 2 - Local Languages */}
               <div className="md:row-span-2 group relative overflow-hidden bg-amber-500/5 rounded-[2rem] border border-amber-500/20 shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all p-8 flex flex-col">
                  <div className="h-12 w-12 rounded-xl bg-amber-500/20 flex flex-shrink-0 items-center justify-center mb-6">
                    <Languages className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-2xl font-black mb-4 font-headline text-amber-900 dark:text-amber-400">Native Tongue Intelligence</h3>
                  <p className="text-amber-900/70 dark:text-amber-400/70 font-medium">
                    Converse seamlessly with your digital agronomist in Hindi, Marathi, or English. Expert advice shouldn't be locked behind language barriers.
                  </p>
                  
                  <div className="mt-auto pt-8 flex gap-2">
                     <span className="px-3 py-1 bg-amber-500/20 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300">ENG</span>
                     <span className="px-3 py-1 bg-amber-500/20 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300">HIN</span>
                     <span className="px-3 py-1 bg-amber-500/20 rounded-full text-xs font-bold text-amber-700 dark:text-amber-300">MAR</span>
                  </div>
               </div>

               {/* Standard Card 3 - Resource */}
               <div className="group relative overflow-hidden bg-card rounded-[2rem] border border-border/50 hover:border-blue-500/50 shadow-sm hover:shadow-xl transition-all p-8">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                    <Sprout className="h-5 w-5 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-headline">Resource Optimization</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Precise suggestions for water and fertilizer to maximize input-ROI and reduce ecological drain.
                  </p>
               </div>

               {/* Standard Card 4 - GIS */}
               <div className="group relative overflow-hidden bg-card rounded-[2rem] border border-border/50 hover:border-purple-500/50 shadow-sm hover:shadow-xl transition-all p-8">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                    <MapIcon className="h-5 w-5 text-purple-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 font-headline">GIS Satellite View</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Earth Engine integrated maps for hyper-local topological and vegetative indices.
                  </p>
               </div>
            </div>
            
            {/* Extended Feature Bar */}
            <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="bg-primary text-primary-foreground rounded-[2rem] p-8 flex items-center justify-between group hover:scale-[1.02] transition-transform">
                   <div>
                      <h3 className="text-2xl font-black mb-2 font-headline flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6" /> Certified Advisory
                      </h3>
                      <p className="text-primary-foreground/80 font-medium">Download printable, certified lab & strategy reports.</p>
                   </div>
                </div>
                <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-[2rem] p-8 flex items-center justify-between group hover:scale-[1.02] transition-transform">
                   <div>
                      <h3 className="text-2xl font-black mb-2 font-headline flex items-center gap-2">
                        <Leaf className="h-6 w-6" /> Real-time Defense
                      </h3>
                      <p className="text-destructive/80 font-medium">Instant alerts on sudden weather drops and pest clusters.</p>
                   </div>
                </div>
            </div>

          </div>
        </section>

        {/* Impact Section */}
        <section id="impact" className="py-24">
          <div className="container mx-auto px-4">
            <div className="bg-primary rounded-3xl p-12 lg:p-20 text-white overflow-hidden relative">
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-3xl md:text-5xl font-bold mb-6 font-headline">Creating a Sustainable Future for Agriculture</h2>
                <div className="space-y-6 text-primary-foreground/90">
                  <p className="text-lg">
                    YieldIQ helps farmers adapt to climate changes and improves planning for markets and storage. 
                    By reducing losses and optimizing inputs, we contribute to long-term agricultural resilience.
                  </p>
                  <ul className="grid sm:grid-cols-2 gap-4">
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      Higher Profitability
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      Sustainable Farming
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      Market Stability
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-accent" />
                      Food Waste Reduction
                    </li>
                  </ul>
                </div>
              </div>
              <div className="absolute right-0 bottom-0 opacity-20 transform translate-y-1/4 translate-x-1/4">
                <Leaf className="w-[500px] h-[500px]" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-muted py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Leaf className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold font-headline">YieldIQ</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 YieldIQ. Empowerment through Agricultural Intelligence.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-primary">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
