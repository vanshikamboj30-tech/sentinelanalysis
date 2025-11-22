import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, Send } from "lucide-react";
import { DetectionEvent } from "@/types/sentinel";
import { toast } from "sonner";
import axios from "axios";

interface ChatInterfaceProps {
  events: DetectionEvent[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
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
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get AI response. Make sure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-card border-border h-full flex flex-col">
      <div className="bg-secondary/50 border-b border-border px-4 py-3 flex items-center gap-2">
        <Brain className="w-4 h-4 text-primary" />
        <span className="font-display text-sm font-semibold">
          NEURAL CORE
        </span>
        <div className="ml-auto">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
        </div>
      </div>

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
                className={`max-w-[85%] rounded-xl px-4 py-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-xl px-4 py-3">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Query the neural core..."
            disabled={isLoading}
            className="bg-secondary border-border font-mono text-sm"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
