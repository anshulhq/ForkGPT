"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatInputProps {
    onSend: (message: string) => void;
    disabled?: boolean;
    placeholder?: string;
}

export function ChatInput({
    onSend,
    disabled = false,
    placeholder = "Type a message...",
}: ChatInputProps) {
    const [input, setInput] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            const newHeight = Math.min(textareaRef.current.scrollHeight, 150);
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [input]);

    useEffect(() => {
        if (!disabled && textareaRef.current) textareaRef.current.focus();
    }, [disabled]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || disabled) return;
        onSend(input.trim());
        setInput("");
        if (textareaRef.current) textareaRef.current.style.height = "auto";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
    };

    return (
        <div className="max-w-4xl mx-auto px-4">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={cn(
                    "relative flex items-end gap-2 p-2.5 rounded-xl transition-all duration-200 bg-secondary border",
                    isFocused ? "border-primary/30 neon-glow" : "border-border"
                )}
            >
                <div className="flex-1 relative min-h-[40px] flex items-center">
                    <textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder}
                        rows={1}
                        disabled={disabled}
                        className="w-full bg-transparent border-none focus:ring-0 resize-none py-2 px-3 text-sm placeholder:text-muted-foreground text-foreground font-sans scroll-smooth"
                    />
                </div>

                <Button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={disabled || !input.trim()}
                    size="icon"
                    className={cn(
                        "h-9 w-9 shrink-0 rounded-lg transition-all duration-200 active:scale-95",
                        input.trim()
                            ? "btn-neon"
                            : "bg-muted border border-border text-muted-foreground"
                    )}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </motion.div>
            <div className="mt-4 flex justify-center py-1">
                <span className="text-[10px] font-medium text-muted-foreground/40 tracking-wider font-mono uppercase">ForkGPT</span>
            </div>
        </div>
    );
}
