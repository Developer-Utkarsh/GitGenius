"use client";
import { useEffect, useRef, memo } from "react";
import { motion, useAnimate } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

export const TextGenerateEffect = memo(
  ({
    words,
    className,
    filter = true,
    duration = 0.8,
  }: {
    words: string;
    className?: string;
    filter?: boolean;
    duration?: number;
  }) => {
    const [scope, animate] = useAnimate();
    const animationCompleted = useRef(false);

    useEffect(() => {
      if (!animationCompleted.current && scope.current) {
        const elements = scope.current.querySelectorAll(".animate-text");

        const animations = elements.forEach((element, index) => {
          animate(
            element,
            {
              opacity: [0, 1],
              filter: filter ? ["blur(8px)", "blur(0px)"] : ["none", "none"],
            },
            {
              duration: duration,
              delay: index * 0.1,
              ease: "easeOut",
            }
          );
        });

        animationCompleted.current = true;
      }

      // Cleanup function
      return () => {
        animationCompleted.current = false;
      };
    }, []); // Empty dependency array

    return (
      <div ref={scope} className={cn("font-normal space-y-2", className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            p: ({ children }) => (
              <motion.p className="animate-text" style={{ opacity: 0 }}>
                {children}
              </motion.p>
            ),
            li: ({ children }) => (
              <motion.li className="animate-text ml-4" style={{ opacity: 0 }}>
                {children}
              </motion.li>
            ),
            code: ({
              className,
              children,
              ...props
            }: {
              className?: string;
              children: React.ReactNode;
            }) => {
              const codeProps = props as any;
              return (
                <motion.code
                  className={cn("animate-text", className)}
                  style={{ opacity: 0 }}
                  {...codeProps}
                >
                  {children}
                </motion.code>
              );
            },
          }}
        >
          {words}
        </ReactMarkdown>
      </div>
    );
  }
);

TextGenerateEffect.displayName = "TextGenerateEffect";
