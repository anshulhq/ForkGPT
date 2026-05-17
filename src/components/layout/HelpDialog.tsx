"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpIcon } from "@/components/icons/HelpIcon";
import { BranchIcon } from "@/components/icons/BranchIcon";
import { MergeIcon } from "@/components/icons/MergeIcon";
import { ForkIcon } from "@/components/icons/ForkIcon";

export function HelpDialog({ children }: { children?: React.ReactNode }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <HelpIcon className="h-3.5 w-3.5" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto bg-card border-border rounded-xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
                        <BranchIcon className="h-4 w-4 text-primary" />
                        <span className="text-gradient">How to use ForkGPT</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm">
                        Master the power of parallel conversation paths.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {[
                        {
                            num: "01",
                            title: "Linear Chat",
                            desc: (
                                <>
                                    Start on the <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[11px] font-mono border border-primary/20">main</code> branch. Every message builds nodes on your primary timeline.
                                </>
                            )
                        },
                        {
                            num: "02",
                            title: "Forking",
                            desc: (
                                <>
                                    Explore &quot;what ifs&quot; by clicking <strong className="text-primary inline-flex items-center gap-1"><ForkIcon className="h-3.5 w-3.5" /> Fork</strong> on any message. This creates a parallel reality from that point.
                                </>
                            )
                        },
                        {
                            num: "03",
                            title: "Branch Tree",
                            desc: (
                                <>
                                    The right panel visualizes your <strong className="text-foreground">Conversation Tree</strong>. Jump between branches to see how different paths unfold.
                                </>
                            )
                        },
                        {
                            num: "04",
                            title: "Merging",
                            desc: (
                                <>
                                    Bring insights back by clicking <strong className="text-[#a78bfa] inline-flex items-center gap-1"><MergeIcon className="h-3.5 w-3.5" /> Merge</strong>. AI distills the exploration into a summary.
                                </>
                            )
                        }
                    ].map((section) => (
                        <section key={section.num} className="space-y-3">
                            <h3 className="font-semibold text-foreground flex items-center gap-2.5 text-sm">
                                <span className="flex items-center justify-center w-6 h-6 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary font-mono">{section.num}</span>
                                {section.title}
                            </h3>
                            <p className="text-muted-foreground pl-8 text-sm leading-relaxed">
                                {section.desc}
                            </p>
                        </section>
                    ))}

                    <div className="pt-6 border-t border-border flex justify-center">
                        <p className="text-[10px] text-muted-foreground/50 italic text-center max-w-sm leading-relaxed font-mono">
                            &quot;Every thought is a node. Every fork is a new dimension.&quot;
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
