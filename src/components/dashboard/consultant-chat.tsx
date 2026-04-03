"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Send, 
  ImagePlus, 
  Loader2, 
  User, 
  Bot, 
  Bug, 
  AlertTriangle,
  CalendarCheck,
  Droplets,
  Sprout,
  ShoppingCart,
  X,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ConsultantChatProps {
  plotData: any;
  cropStage: any;
  daysElapsed: number;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  images?: string[];         // Base64 strings for user, or null
  diagnosis?: any;           // from AI
  actionPlan?: any[];        // from AI
}

export function ConsultantChat({ plotData, cropStage, daysElapsed }: ConsultantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle Initial Greeting
  useEffect(() => {
    if (messages.length === 0 && plotData) {
      setMessages([{
        id: 'msg-0',
        role: 'model',
        content: `Hello! I am your AI Agronomist for ${plotData.name || 'this plot'}. I see you're growing ${plotData.cropType || 'a crop'} currently in the **${cropStage?.label || 'Early'}** stage (Day ${daysElapsed}). How can I help you today? You can ask about irrigation, upload pictures of diseased leaves, or ask for a spray schedule.`,
      }]);
    }
  }, [plotData]);

  // Convert uploaded files to Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setSelectedImages(prev => [...prev, base64String]);
      };
      reader.readAsDataURL(file);
    });
    
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!inputValue.trim() && selectedImages.length === 0) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      images: selectedImages.length > 0 ? [...selectedImages] : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setSelectedImages([]);
    
    // STARTUP MODE: Context Truncation & Token Analysis
    const MAX_HISTORY_TURNS = 10;
    const historyToSend = messages.slice(-MAX_HISTORY_TURNS).map(m => {
       // Deep copy and strip images for memoryturns
       return { role: m.role, content: m.content };
    });

    // Token estimation (Rough heuristic: 4 chars per token)
    const totalChars = historyToSend.reduce((sum, m) => sum + m.content.length, 0) + (userMsg.content?.length || 0);
    const estTokens = Math.ceil(totalChars / 4) + (userMsg.images ? 1500 : 0); // Images cost fixed context tokens in Gemini
    console.log(`[Token Analytics] Turn Cost: ~${estTokens} tokens. Turn Depth: ${historyToSend.length}`);

    setIsLoading(true);

    try {
      // Setup payload for our Genkit API
      const payload = {
        userMessage: userMsg.content || "Please analyze these images.",
        imageUrls: userMsg.images,
        chatHistory: historyToSend,
        plotContext: {
          cropType: plotData.cropType || "Unknown",
          soilType: plotData.soilType || "Unknown",
          currentStage: cropStage?.name || "Unknown",
          daysElapsed: daysElapsed,
          location: plotData.location || "Unknown",
        },
        weatherContext: {
          temp: "32°C", // simulated live weather
          condition: "Clear",
        }
      };

      const response = await fetch('/api/consultant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();
      
      if (!resData.success) throw new Error(resData.error);
      
      const aiOut = resData.data;

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: aiOut.message,
        diagnosis: aiOut.diagnosis,
        actionPlan: aiOut.actionPlan,
      };

      setMessages(prev => [...prev, modelMsg]);

    } catch (error: any) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I'm sorry, I encountered an error connecting to the intelligence server. Please try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render AI Action icons
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'SPRAY': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'IRRIGATION': return <Droplets className="h-4 w-4 text-blue-500" />;
      case 'FERTILIZER': return <Sprout className="h-4 w-4 text-green-500" />;
      default: return <CalendarCheck className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="flex flex-col h-[70vh] border-primary/20 shadow-lg">
      <CardHeader className="bg-primary/5 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center border border-primary/30">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg text-primary">YieldIQ Plot Consultant</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground">{plotData.name} • {plotData.cropType}</span>
              <div className="flex items-center gap-1 text-[9px] bg-primary/10 text-primary px-1.5 rounded-full font-bold">
                 <Zap className="h-2 w-2" /> ECO-MODE
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 flex flex-col relative overflow-hidden">
        {/* Chat Scroll Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-6 bg-muted/20"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              <div className={`flex max-w-[85%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-background border shadow-sm">
                  {msg.role === 'user' ? <User className="h-4 w-4 text-muted-foreground" /> : <Bot className="h-4 w-4 text-primary" />}
                </div>

                {/* Bubble Container */}
                <div className="space-y-3 min-w-[200px]">
                  
                  {/* User Images Attachment */}
                  {msg.images && msg.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end">
                      {msg.images.map((img, i) => (
                        <div key={i} className="relative h-24 w-24 rounded-md overflow-hidden border-2 border-primary/20 shadow-sm">
                           {/* Using literal img tag for base64 data to avoid next/image requirement of whitelisted domains */}
                           <img src={img} alt="Uploaded crop" className="object-cover h-full w-full" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Main Text Bubble */}
                  {msg.content && (
                    <div className={`p-3 rounded-xl shadow-sm text-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-card border rounded-tl-sm'}`}>
                      {/* Very basic markdown bold parsing for better UX without pulling in react-markdown */}
                      <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                    </div>
                  )}

                  {/* AI Generated Diagnostics Widget */}
                  {msg.diagnosis && msg.diagnosis.isDiseaseFound && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2 text-destructive font-bold text-sm uppercase tracking-wider">
                        <Bug className="h-4 w-4" /> Diagnosis Alert
                      </div>
                      <p className="text-sm font-semibold mb-1">Issue: {msg.diagnosis.diseaseName}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="outline" className="border-destructive/50 text-destructive bg-background">Severity: {msg.diagnosis.severity}</Badge>
                        <span className="text-xs text-muted-foreground font-bold">Confidence: {msg.diagnosis.confidenceScore}%</span>
                      </div>
                    </div>
                  )}

                  {/* AI Generated Action Plan Widget */}
                  {msg.actionPlan && msg.actionPlan.length > 0 && (
                     <div className="space-y-2">
                        {msg.actionPlan.map((action, i) => (
                          <div key={i} className="bg-background border rounded-lg overflow-hidden shadow-sm">
                            <div className="bg-muted px-3 py-2 border-b flex justify-between items-center bg-secondary/50">
                              <div className="flex items-center gap-2 font-bold text-xs">
                                {getActionIcon(action.type)}
                                {action.title}
                              </div>
                              <Badge variant="secondary" className="text-[10px] uppercase font-black tracking-widest">{action.date}</Badge>
                            </div>
                            <div className="p-3 text-sm">
                              <p className="text-muted-foreground leading-relaxed">{action.description}</p>
                              {action.productName && (
                                <div className="mt-3 flex justify-between items-center pt-3 border-t border-dashed">
                                  <span className="font-semibold flex items-center gap-1.5"><Sprout className="h-3 w-3 text-green-600"/> {action.productName}</span>
                                  <Button size="sm" variant="outline" className="h-7 text-xs border-primary/20 text-primary gap-1">
                                    <ShoppingCart className="h-3 w-3" /> Buy in Market
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                     </div>
                  )}

                </div>
              </div>

            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-background border">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-card border rounded-xl rounded-tl-sm p-4 flex items-center gap-2 shadow-sm h-12">
                   <div className="flex gap-1">
                     <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" />
                     <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                     <span className="h-2 w-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-background border-t p-3">
          {/* Image Preview strip before sending */}
          {selectedImages.length > 0 && (
            <div className="flex gap-2 mb-3 bg-muted/50 p-2 rounded-lg overflow-x-auto border">
              {selectedImages.map((src, i) => (
                <div key={i} className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden shadow-sm group">
                  <img src={src} className="h-full w-full object-cover" />
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 bg-black/50 hover:bg-destructive text-white rounded-full p-1 opacity-100 transition-opacity"
                  >
                     <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <Button 
               variant="outline" 
               size="icon" 
               className="shrink-0 rounded-full h-10 w-10 hover:bg-primary/10 hover:text-primary transition-colors border-dashed border-2"
               onClick={() => fileInputRef.current?.click()}
               disabled={isLoading}
            >
              <ImagePlus className="h-5 w-5 text-muted-foreground hover:text-primary" />
            </Button>
            <Input 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about this plot or upload an image..."
              className="flex-1 rounded-full bg-muted border-none h-10 px-5 focus-visible:ring-1 focus-visible:ring-primary/50"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || (!inputValue.trim() && selectedImages.length === 0)}
              className="shrink-0 rounded-full h-10 w-10 p-0 shadow-md transition-transform hover:scale-105"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
