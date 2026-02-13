import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send, Sparkles, AlertCircle } from "lucide-react";
import { DetectionEvent } from "@/types/sentinel";
import { toast } from "sonner";
import axios from "axios";

interface ChatInterfaceProps {
  events: DetectionEvent[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
  isError?: boolean;
}

const ChatInterface = ({ events }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Neural Core initialized. I can analyze the surveillance data and answer questions about detected threats.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await axios.post<{ reply: string }>(
        "http://localhost:8000/chat",
        {
          query: userMessage,
          logs: events,
        }
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response.data.reply },
      ]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorMessage = error.response?.data?.detail || "Failed to get AI response. Make sure the backend is running.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage, isError: true },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQueries = [
    "Summarize threats",
    "High-risk events",
    "Detection patterns",
  ];

  return (
    <Card className="bg-card border-border h-[600px] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary/80 to-secondary/40 border-b border-border px-4 py-3 flex items-center gap-3">
        <div className="relative">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10">
            <Brain className="w-4 h-4 text-primary" />
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success ring-2 ring-card animate-pulse" />
        </div>
        <div className="flex-1">
          <span className="font-display text-sm font-semibold flex items-center gap-1">
            NEURAL CORE
            <Sparkles className="w-3 h-3 text-primary" />
          </span>
          <p className="text-[10px] text-muted-foreground font-mono">OPENAI • READY</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : message.isError
                    ? "bg-destructive/10 border border-destructive/30 text-destructive rounded-bl-md"
                    : "bg-secondary/80 text-foreground rounded-bl-md"
                }`}
              >
                {message.isError && (
                  <div className="flex items-center gap-1.5 mb-1 text-xs opacity-80">
                    <AlertCircle className="w-3 h-3" />
                    Error
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary/80 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.15s]" />
                    <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.3s]" />
                  </div>
                  <span className="text-xs text-muted-foreground">Analyzing...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((query) => (
              <button
                key={query}
                onClick={() => setInput(query)}
                className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors border border-border/50"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4 bg-secondary/20">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about the surveillance data..."
            disabled={isLoading}
            className="bg-background/80 border-border/50 font-mono text-sm focus:border-primary/50"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 shadow-lg shadow-primary/20"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;