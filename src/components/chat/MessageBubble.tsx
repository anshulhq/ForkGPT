"use client";

import React, { useState } from "react";
import { Message } from "@/db/schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { GitBranch, ChevronLeft, ChevronRight, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { motion, Variants } from "framer-motion";

interface MessageBubbleProps {
    message: Message;
    siblingCount: number;
    currentSiblingIndex: number;
    onFork: (messageId: string) => void;
    onNavigateSibling: (messageId: string, direction: "prev" | "next") => void;
    isStreaming?: boolean;
}

function CollapsibleTranscript({ content }: { content: string }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="rounded-lg overflow-hidden bg-secondary mt-3 border border-border">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 text-[9px] font-mono font-semibold uppercase tracking-[0.15em] text-[#a78bfa]/60 hover:text-[#a78bfa] hover:bg-accent transition-colors"
            >
                <div className="flex items-center gap-2">
                    <ChevronRight className={cn("h-2.5 w-2.5 transition-transform", isOpen && "rotate-90")} />
                    <span>merge_transcript.log</span>
                </div>
            </button>
            {isOpen && (
                <div className="px-3 pb-3 text-[11px] font-mono text-muted-foreground border-t border-border">
                    <div className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed pt-3">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    );
}

const entryVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export const MessageBubble = React.memo(function MessageBubble({
    message,
    siblingCount,
    currentSiblingIndex,
    onFork,
    onNavigateSibling,
    isStreaming = false,
}: MessageBubbleProps) {
    const isUser = message.role === "user";
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (isUser) {
        return (
            <motion.div variants={entryVariants} initial="hidden" animate="visible" layout className="flex justify-end group py-2">
                <div className="max-w-[85%]">
                    <div className="bg-primary/8 border border-primary/15 px-4 py-3 rounded-l-2xl rounded-tr-sm">
                        <div className="prose text-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 leading-relaxed">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                        </div>
                    </div>
                    <div className="flex justify-end gap-1.5 mt-1.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200">
                        {siblingCount > 1 && (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-secondary border border-border text-muted-foreground text-[10px] font-mono">
                                <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-accent rounded" onClick={() => onNavigateSibling(message.id, "prev")} disabled={currentSiblingIndex === 0}>
                                    <ChevronLeft className="h-2.5 w-2.5" />
                                </Button>
                                <span className="font-bold">{currentSiblingIndex + 1}/{siblingCount}</span>
                                <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-accent rounded" onClick={() => onNavigateSibling(message.id, "next")} disabled={currentSiblingIndex === siblingCount - 1}>
                                    <ChevronRight className="h-2.5 w-2.5" />
                                </Button>
                            </div>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 px-3 rounded-md text-[11px] bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-accent" onClick={handleCopy}>
                            {copied ? <Check className="h-3 w-3 mr-1.5" /> : <Copy className="h-3 w-3 mr-1.5" />}
                            {copied ? "Copied" : "Copy"}
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-3 rounded-md text-[11px] bg-secondary border border-border text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5" onClick={() => onFork(message.id)}>
                            <GitBranch className="h-3 w-3 mr-1.5" />
                            Fork
                        </Button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            variants={entryVariants}
            initial="hidden"
            animate="visible"
            layout={!isStreaming}
            className={cn("flex gap-3 group py-3", isStreaming && "animate-none")}
        >
            <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                message.role === "system"
                    ? "bg-[#a78bfa]/10 border-[#a78bfa]/15"
                    : "bg-card border-border"
            )}>
                {message.role === "system" ? (
                    <GitBranch className="h-4 w-4 text-[#a78bfa]/60" />
                ) : (
                    <span className="text-[8px] font-bold tracking-[0.15em] text-primary/60 font-mono uppercase">AI</span>
                )}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
                <div className="prose max-w-none">
                    {message.role === "system" && message.content.includes("### Transcript:") ? (
                        <div className="flex flex-col gap-3">
                            <div className="bg-[#a78bfa]/5 border border-[#a78bfa]/15 p-4 rounded-xl text-[#a78bfa]/80 font-medium italic">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                    {message.content.split("\n\n### Transcript:\n")[0]}
                                </ReactMarkdown>
                            </div>
                            <CollapsibleTranscript content={message.content.split("\n\n### Transcript:\n")[1]} />
                        </div>
                    ) : (
                        <div className={cn(
                            "text-sm leading-relaxed p-4 rounded-l-2xl rounded-br-sm bg-card border transition-all",
                            message.role === "system" ? "border-[#a78bfa]/15 text-[#a78bfa]/70 italic font-medium" : "border-border",
                            isStreaming && "transition-none"
                        )}>
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {message.content}
                            </ReactMarkdown>
                            {isStreaming && (
                                <span className="inline-block w-1 h-4 ml-0.5 bg-primary/60 animate-pulse rounded-sm align-middle" />
                            )}
                        </div>
                    )}
                </div>
                <div className="flex justify-start gap-1.5 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" asChild className="h-7 px-3 rounded-md text-[11px] bg-secondary border border-border text-muted-foreground hover:text-foreground hover:bg-accent" onClick={handleCopy}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            {copied ? <Check className="h-3 w-3 mr-1.5" /> : <Copy className="h-3 w-3 mr-1.5" />}
                            {copied ? "Copied" : "Copy"}
                        </motion.button>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="h-7 px-3 rounded-md text-[11px] bg-secondary border border-border text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5" onClick={() => onFork(message.id)}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <GitBranch className="h-3 w-3 mr-1.5" />
                            Fork
                        </motion.button>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
});
