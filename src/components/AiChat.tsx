"use client";

import { useState, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Github,
  Send,
  User,
  Bot,
  MessageSquareCode,
  Copy,
  Check,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cardGradientClasses } from "@/components/ui/card-gradient";
import { Repository } from "@/types/github";
import { getChatResponse } from "@/services/gemini";
import type { ChatMessage } from "@/services/gemini/types";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "./error-boundary";
import { TextGenerateEffect } from "./TextGenerateEffect";

interface AiChatProps {
  userData: {
    avatar_url: string;
    name: string;
    login: string;
  };
  stats: any;
  repositories: Repository[];
}

const MessageBubble = memo(
  ({
    message,
    isSequential,
    userAvatar,
  }: {
    message: { role: string; content: string; id: string };
    isSequential?: boolean;
    userAvatar?: string;
  }) => {
    const [copied, setCopied] = useState(false);
    const messageId = useRef(`msg-${message.id}`).current;

    const handleCopy = async () => {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div
        className={`flex ${
          message.role === "user" ? "justify-end" : "justify-start"
        } mb-2`}
      >
        <div
          className={cn(
            "flex items-start gap-2 max-w-[80%] group",
            message.role === "user" ? "flex-row-reverse" : "flex-row",
            isSequential && "mt-1"
          )}
        >
          {!isSequential && (
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden",
                "ring-1 ring-offset-1 ring-offset-background sticky top-0",
                message.role === "user"
                  ? "ring-primary/20 bg-primary/10"
                  : "ring-blue-600/20 bg-blue-600/10"
              )}
            >
              {message.role === "user" ? (
                userAvatar ? (
                  <img
                    src={userAvatar}
                    alt="User"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )
              ) : (
                <Bot className="w-4 h-4 text-blue-500" />
              )}
            </div>
          )}
          <div
            className={cn(
              "relative group transition-all duration-200",
              isSequential && message.role === "user" ? "mr-10" : "",
              isSequential && message.role === "assistant" ? "ml-10" : ""
            )}
          >
            <div
              className={cn(
                "p-3 rounded-2xl text-sm",
                "border shadow-sm transition-colors duration-200",
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-none border-primary/20"
                  : "bg-blue-500/10 text-foreground rounded-tl-none border-blue-500/20"
              )}
            >
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {message.role === "assistant" ? (
                  <TextGenerateEffect
                    key={messageId}
                    words={message.content}
                    className="markdown-content"
                    filter={false}
                    duration={0.8}
                  />
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    className="markdown-content text-sm leading-relaxed"
                  >
                    {message.content}
                  </ReactMarkdown>
                )}
              </div>
              {message.role === "assistant" && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

MessageBubble.displayName = "MessageBubble";

export function AiChat({ userData, stats, repositories }: AiChatProps) {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string; id: string }>
  >([
    {
      role: "assistant",
      content:
        "Hi! I'm your GitHub AI assistant. I can help you analyze your GitHub stats and provide insights. What would you like to know?",
      id: "welcome",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const formattedData = { userData, stats, repositories };

      // Add user message
      const userMessageId = Date.now().toString();
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: input.trim(),
          id: userMessageId,
        },
      ]);
      setInput("");

      // Get AI response
      const aiResponse = await getChatResponse(
        input,
        messages.map((msg) => ({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content,
        })) as ChatMessage[],
        formattedData
      );

      // Add AI response
      const aiMessageId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: aiResponse,
          id: aiMessageId,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card
      className={cn(cardGradientClasses.wrapper, "h-[700px] flex flex-col")}
    >
      {cardGradientClasses.gradients.map((className, i) => (
        <div key={i} className={className} />
      ))}

      <CardHeader className="relative space-y-0 pb-4 border-b border-white/10 flex-shrink-0">
        <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-500 to-blue-700 bg-clip-text text-transparent flex items-center gap-2">
          <MessageSquareCode className="w-5 h-5" />
          GitHub AI Assistant
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 flex flex-col flex-1 overflow-hidden bg-gradient-to-b from-background/50 to-background/80">
        <ErrorBoundary
          fallback={
            <div className="p-4 text-red-500">Failed to load chat.</div>
          }
        >
          <ScrollArea className="flex-1 px-4 py-4">
            <div className="space-y-3">
              <AnimatePresence mode="wait">
                {messages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isSequential={
                      index > 0 && messages[index - 1].role === message.role
                    }
                    userAvatar={userData?.avatar_url}
                  />
                ))}
              </AnimatePresence>
              {isLoading && <LoadingBubble />}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </ErrorBoundary>

        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur-md flex-shrink-0">
          <form onSubmit={handleSubmit} className="relative group">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your GitHub stats..."
              className={cn(
                "pr-24 h-11 text-sm",
                "bg-white/5 border-white/10",
                "focus:bg-white/10 focus:border-blue-500/30",
                "transition-all duration-200",
                "rounded-xl"
              )}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              className={cn(
                "absolute right-1 top-1 h-9",
                "bg-gradient-to-r from-blue-500 to-blue-600",
                "hover:from-blue-600 hover:to-blue-700",
                "text-white font-medium px-4",
                "flex items-center gap-2 rounded-lg",
                "transition-all duration-200",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <>
                  <MessageSquareCode className="w-4 h-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}

const LoadingBubble = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.2 }}
    className="flex justify-start mb-4"
  >
    <div className="flex items-start space-x-2">
      <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
        <Bot className="w-4 h-4 text-blue-500" />
      </div>
      <div className="p-3 rounded-2xl bg-blue-500/10 text-foreground rounded-tl-none border border-blue-500/20">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="flex space-x-2"
        >
          <div className="w-2 h-2 rounded-full bg-blue-500/40" />
          <div className="w-2 h-2 rounded-full bg-blue-500/40" />
          <div className="w-2 h-2 rounded-full bg-blue-500/40" />
        </motion.div>
      </div>
    </div>
  </motion.div>
);
