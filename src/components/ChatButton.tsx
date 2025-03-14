
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send } from "lucide-react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const ChatButton = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Add user message
    const userMessage: Message = { role: "user", content: inputValue.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Format messages history for the API
      const messageHistory = messages
        .concat(userMessage)
        .map(({ role, content }) => ({ role, content }));
      
      // Call the Edge Function
      const { data, error } = await supabase.functions.invoke('chat-with-groq', {
        body: { messages: messageHistory }
      });
      
      if (error) {
        console.error("Error calling Groq API:", error);
        toast({
          title: "Error",
          description: "Failed to get response from AI assistant",
          variant: "destructive",
        });
        throw error;
      }
      
      // Add assistant response
      setMessages((prev) => [
        ...prev, 
        { role: "assistant", content: data.message }
      ]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg bg-enloe-green hover:bg-enloe-green/90 dark:bg-enloe-yellow dark:hover:bg-enloe-yellow/90 text-white dark:text-enloe-dark"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[80vh] max-h-[80vh] rounded-t-xl">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold">Enloe Assistant</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-70">
                  <MessageCircle className="h-12 w-12 mb-4 text-enloe-green dark:text-enloe-yellow" />
                  <p className="max-w-xs">
                    Hi! I'm the Enloe Assistant. Ask me anything about school schedules or activities!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message, i) => (
                    <div
                      key={i}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === "user"
                            ? "bg-enloe-green/90 dark:bg-enloe-green text-white"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-enloe-green/50 dark:bg-enloe-yellow/50 animate-pulse delay-0"></div>
                          <div className="w-2 h-2 rounded-full bg-enloe-green/50 dark:bg-enloe-yellow/50 animate-pulse delay-150"></div>
                          <div className="w-2 h-2 rounded-full bg-enloe-green/50 dark:bg-enloe-yellow/50 animate-pulse delay-300"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question..."
                  className="resize-none"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isLoading || !inputValue.trim()}
                  size="icon"
                  className="bg-enloe-green hover:bg-enloe-green/90 dark:bg-enloe-yellow dark:hover:bg-enloe-yellow/90 text-white dark:text-enloe-dark"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
};
