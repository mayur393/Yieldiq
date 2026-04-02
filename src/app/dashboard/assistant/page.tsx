"use client";

import { useState, useRef, useEffect } from "react";
import { localLanguageAssistant } from "@/ai/flows/local-language-assistant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Languages, User, Bot, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// Helper: detect Gemini quota/rate-limit errors
function isQuotaError(error: any): boolean {
  const msg = (error?.message || String(error)).toLowerCase();
  return (
    msg.includes('429') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('too many requests')
  );
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Namaste! I am your YieldIQ Assistant. You can ask me questions about farming in Hindi, Marathi, or English. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const result = await localLanguageAssistant({ query: userMessage });
      setMessages((prev) => [...prev, { role: "assistant", content: result.response }]);
    } catch (error: any) {
      const message = isQuotaError(error)
        ? "⚠️ Your daily limit is exceeded. Please try again tomorrow."
        : "Sorry, I encountered an error. Please try again later.";
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[650px] max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-headline">AI Assistant</h1>
          <p className="text-sm text-muted-foreground">Expert farming advice in your local language.</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1 rounded-full border border-primary/10">
          <Languages className="h-4 w-4 text-primary" />
          <span className="text-xs font-medium">Hindi • Marathi • English</span>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col border-primary/10 shadow-xl bg-card/50 backdrop-blur-sm">
        <CardContent className="flex-1 p-0 flex flex-col min-h-0">
          <ScrollArea className="flex-1" type="always">
            <div className="p-6 space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-3 max-w-[80%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-primary text-primary-foreground shadow-sm" : "bg-secondary text-primary border border-primary/10"}`}>
                      {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`rounded-2xl px-4 py-2 text-sm shadow-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                      {m.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[80%]">
                    <div className="h-8 w-8 rounded-full bg-secondary text-primary flex items-center justify-center border border-primary/10">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-muted rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm border border-primary/5">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">YieldIQ is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-muted/20">
            <div className="flex gap-2">
              <Input 
                placeholder="Ask about crops, soil, weather, or pests..." 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="bg-background border-primary/20 shadow-sm focus-visible:ring-primary/30"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="shadow-sm">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {["How much water does wheat need?", "पिकावर कीड पडली तर काय करावे?", "मिट्टी की उर्वरता कैसे बढ़ाएं?"].map((q, i) => (
          <Button key={i} variant="outline" size="sm" className="rounded-full text-xs bg-background hover:bg-primary/5 hover:border-primary/50 shadow-sm" onClick={() => setInput(q)}>
            {q}
          </Button>
        ))}
      </div>
    </div>
  );
}
