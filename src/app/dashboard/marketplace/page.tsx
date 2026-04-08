"use client";

import { ShoppingCart, Star, Package, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function MarketplaceComingSoonPage() {
  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-700">
      <div className="relative mb-8">
        <div className="absolute inset-0 -z-10 animate-pulse rounded-full bg-primary/20 blur-3xl opacity-60 h-48 w-48 mx-auto" />
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 shadow-2xl mx-auto shadow-primary/30 rotate-3 transition-transform hover:rotate-0 duration-300">
          <ShoppingCart className="h-12 w-12 text-primary-foreground drop-shadow-md" />
        </div>
      </div>

      <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground drop-shadow-sm">
        YieldIQ Marketplace
      </h1>
      <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6">
        Coming Soon
      </h2>

      <p className="max-w-xl text-lg text-muted-foreground mb-10 leading-relaxed">
        We're building a seamless, integrated marketplace for all your agronomic needs. Soon, you'll be able to purchase fertilizers, seeds, and precision farming equipment directly within YieldIQ based on your plot's AI strategy.
        <br/><br/>
        For now, please rest and enjoy exploring our other powerful intelligence features!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 max-w-4xl w-full">
        <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1 duration-300 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Zap className="h-8 w-8 text-amber-500 mb-4" />
            <h3 className="font-bold mb-2">Direct Procurement</h3>
            <p className="text-sm text-muted-foreground">Buy exactly what your AI advisor recommends in one click.</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1 duration-300 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Star className="h-8 w-8 text-primary mb-4" />
            <h3 className="font-bold mb-2">Trusted Vendors</h3>
            <p className="text-sm text-muted-foreground">Premium agricultural suppliers vetted for quality & speed.</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur border-primary/10 hover:border-primary/30 transition-all hover:-translate-y-1 duration-300 shadow-sm">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <ShieldCheck className="h-8 w-8 text-emerald-500 mb-4" />
            <h3 className="font-bold mb-2">Secure Transactions</h3>
            <p className="text-sm text-muted-foreground">Safe, fast, and transparent procurement logistics.</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg" className="rounded-full font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-transform duration-300">
          <Link href="/dashboard/strategy">
            Explore Cultivation Strategy <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full font-semibold border-primary/20 hover:bg-primary/5 hover:scale-105 transition-transform duration-300">
          <Link href="/dashboard">
            Back to Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
