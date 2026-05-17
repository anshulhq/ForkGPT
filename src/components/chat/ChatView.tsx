"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "@/db/schema";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BranchIcon } from "@/components/icons/BranchIcon";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { HeroAnimation } from "@/components/home/HeroAnimation";
import { GithubIcon } from "lucide-react";

export interface MessageWithMeta extends Message {
    siblingCount: number;
    currentSiblingIndex: number;
}

interface ChatViewProps {
    messages: MessageWithMeta[];
    branchName: string;
    onSendMessage: (content: string) => void;
    onFork: (messageId: string, content: string) => void;
    onNavigateSibling: (messageId: string, direction: "prev" | "next") => void;
    isLoading?: boolean;
    streamingContent?: string;
}

export function ChatView({
    messages,
    branchName: _branchName,
    onSendMessage,
    onFork,
    onNavigateSibling,
    isLoading = false,
    streamingContent,
}: ChatViewProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [forkModalOpen, setForkModalOpen] = useState(false);
    const [forkMessageId, setForkMessageId] = useState<string | null>(null);
    const [forkContent, setForkContent] = useState("");
    const [forkSourceContent, setForkSourceContent] = useState("");

    const prevMessageCountRef = useRef(0);
    const isAtBottomRef = useRef(true);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const diff = Math.abs(target.scrollHeight - target.scrollTop - target.clientHeight);
        isAtBottomRef.current = diff < 50;
    };

    useEffect(() => {
        const count = messages.length;
        const prevCount = prevMessageCountRef.current;
        prevMessageCountRef.current = count;
        const isBranchSwitch = count !== prevCount + 1 && count !== prevCount - 1 && count !== prevCount;

        if (isBranchSwitch) {
            isAtBottomRef.current = true;
            scrollToBottom("auto");
            return;
        }

        if (isAtBottomRef.current || (count > 0 && messages[count - 1].role === "user")) {
            scrollToBottom();
        }
    }, [messages, streamingContent]);

    useEffect(() => { scrollToBottom("auto"); }, []);

    const handleForkClick = (messageId: string) => {
        const message = messages.find((m) => m.id === messageId);
        if (message) setForkSourceContent(message.content);
        setForkMessageId(messageId);
        setForkContent("");
        setForkModalOpen(true);
    };

    const handleForkSubmit = () => {
        if (forkMessageId && forkContent.trim()) {
            onFork(forkMessageId, forkContent.trim());
            setForkModalOpen(false);
            setForkMessageId(null);
            setForkContent("");
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div onScroll={handleScroll} className="flex-1 overflow-y-auto nexus-scroll scroll-smooth">
                <div className="max-w-4xl mx-auto px-6 py-8">
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex flex-col items-center justify-center min-h-[75vh] text-center max-w-4xl mx-auto px-4"
                        >
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 sm:mb-5"
                                style={{ boxShadow: "0 0 40px rgba(45, 212, 191, 0.1)" }}
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-primary sm:w-8 sm:h-8">
                                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
                                    <path d="M12 2C17.52 2 22 6.48 22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M2 12C2 17.52 6.48 22 12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </motion.div>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-2 sm:mb-3">
                                Start a <span className="text-gradient">Conversation</span>
                            </h2>
                            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto leading-relaxed mb-4">
                                Every idea branches. Every fork is a new dimension of thought.
                                <span className="block mt-1.5 text-foreground/60 font-medium">Explore your mind&apos;s graph.</span>
                            </p>

                            <div className="flex flex-col items-center gap-2 mt-1 mb-2">
                                <p className="text-sm text-white font-medium">
                                    Built with <span className="text-base text-red-500">❤️</span> by Anshul Kumar
                                </p>
                                <a
                                    href=""
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-medium bg-secondary border border-border text-muted-foreground hover:text-[#2dd4bf] hover:border-[#2dd4bf]/30 hover:bg-[#2dd4bf]/5 transition-all duration-200"
                                >
                                    <GithubIcon className="h-3.5 w-3.5" />
                                    View Source
                                </a>
                            </div>

                            <div className="w-full mb-4 -mt-2"><HeroAnimation /></div>

                            <div className="w-full max-w-xl relative z-10 mb-6 mt-2">
                                <ChatInput onSend={onSendMessage} disabled={isLoading} placeholder="Start your first conversation..." />
                            </div>

                            <div className="flex flex-col items-center gap-4 w-full">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary/40">Quick starts</p>
                                <div className="flex flex-wrap justify-center gap-2 w-full max-w-xl px-4">
                                    {["Write a sci-fi short story", "Debate free will vs determinism", "Design a concept for a puzzle game", "Compose a haiku about entropy"].map((starter, i) => (
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 + 0.6 } }}
                                            whileHover={{ scale: 1.02, y: -1 }}
                                            whileTap={{ scale: 0.98 }}
                                            key={starter}
                                            onClick={() => onSendMessage(starter)}
                                            className="px-4 py-2 rounded-lg text-xs font-medium bg-secondary border border-border text-muted-foreground hover:text-primary hover:border-primary/25 hover:bg-primary/5 transition-all duration-200"
                                        >
                                            {starter}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <LayoutGroup>
                            <div className="space-y-6">
                                <AnimatePresence mode="popLayout">
                                    {messages.map((message) => (
                                        <MessageBubble key={message.id} message={message} siblingCount={message.siblingCount} currentSiblingIndex={message.currentSiblingIndex} onFork={handleForkClick} onNavigateSibling={onNavigateSibling} />
                                    ))}
                                </AnimatePresence>

                                {streamingContent && (
                                    <MessageBubble
                                        message={{ id: "streaming", content: streamingContent, role: "assistant", parentId: null, branchId: "", isHead: true, createdAt: new Date() }}
                                        siblingCount={1} currentSiblingIndex={0} onFork={() => { }} onNavigateSibling={() => { }} isStreaming
                                    />
                                )}

                                {isLoading && !streamingContent && (
                                    <div className="flex items-center gap-3 py-3 px-2">
                                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                                            <span className="text-[9px] font-bold text-primary/70 font-mono tracking-wider">AI</span>
                                        </div>
                                        <div className="flex gap-1 items-center">
                                            <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0 }} className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                                            <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                                            <motion.span animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary/50 rounded-full" />
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        </LayoutGroup>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {messages.length > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="shrink-0 p-4 border-t border-border bg-background/95 backdrop-blur-xl relative z-20"
                    >
                        <div className="max-w-4xl mx-auto w-full relative">
                            <ChatInput onSend={onSendMessage} disabled={isLoading} placeholder={isLoading ? "Thinking..." : "Continue the branch..."} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Dialog open={forkModalOpen} onOpenChange={setForkModalOpen}>
                <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col bg-card border-border rounded-xl p-0 overflow-hidden">
                    <div className="p-5 pb-3 border-b border-border">
                        <DialogTitle className="flex items-center gap-2.5 text-base font-bold tracking-tight">
                            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
                                <BranchIcon className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <span>Create Branch</span>
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-xs mt-1.5">
                            Fork from this message to explore a different path.
                        </DialogDescription>
                    </div>

                    <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col p-5 overflow-y-auto min-h-0 nexus-scroll">
                        {forkSourceContent && (
                            <div className="rounded-lg bg-secondary p-3.5 border border-border mb-4">
                                <p className="text-[9px] uppercase tracking-[0.15em] text-primary/50 mb-2 font-semibold">Source context</p>
                                <div className="text-sm text-muted-foreground prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{forkSourceContent}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2.5">
                            <label className="text-xs font-medium text-foreground/70">Your new direction</label>
                            <Textarea
                                placeholder="What would you like to say instead?"
                                value={forkContent}
                                onChange={(e) => setForkContent(e.target.value)}
                                rows={3}
                                className="resize-none text-sm rounded-lg bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20 focus-visible:border-primary/20"
                                autoFocus
                            />
                        </div>
                    </div>

                    <DialogFooter className="p-4 border-t border-border gap-2">
                        <Button variant="ghost" onClick={() => setForkModalOpen(false)} className="rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleForkSubmit} disabled={!forkContent.trim()} className="rounded-lg btn-neon text-xs disabled:opacity-30">
                            Create Branch
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
