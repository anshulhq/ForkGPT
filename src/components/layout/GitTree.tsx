"use client";

import React, { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { BranchIcon } from "@/components/icons/BranchIcon";
import { MergeIcon } from "@/components/icons/MergeIcon";
import { DeleteIcon } from "@/components/icons/DeleteIcon";
import { PanelIcon } from "@/components/icons/PanelIcon";
import { PanelCloseIcon } from "@/components/icons/PanelCloseIcon";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface GitTreeProps {
    branches: {
        id: string;
        name: string;
        parentBranchId: string | null;
        rootMessageId: string | null;
        messageCount?: number;
        isMerged?: boolean;
    }[];
    currentBranchId: string | null;
    onSelectBranch: (branchId: string) => void;
    onDeleteBranch: (branchId: string) => void;
    onMergeBranch?: (branchId: string) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    isMobile?: boolean;
}

const treeItemVariants: Variants = {
    hidden: { opacity: 0, x: 8 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.04, duration: 0.25, ease: "easeOut" }
    })
};

export const GitTree = memo(function GitTree({
    branches,
    currentBranchId,
    onSelectBranch,
    onDeleteBranch,
    onMergeBranch,
    isCollapsed = false,
    onToggleCollapse,
    isMobile = false,
}: GitTreeProps) {
    const mainBranch = useMemo(() => branches.find((b) => b.name === "main" || !b.parentBranchId), [branches]);
    const childBranches = useMemo(() => branches.filter((b) => b.parentBranchId), [branches]);

    if (isCollapsed) {
        return (
            <div className="w-12 h-full bg-sidebar border-l border-sidebar-border flex flex-col items-center py-4">
                <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-7 w-7 mb-4 text-muted-foreground hover:text-foreground">
                    <PanelIcon className="h-3.5 w-3.5" />
                </Button>
                <div className="flex-1 flex flex-col items-center gap-2.5 mt-2">
                    {branches.slice(0, 6).map((branch) => (
                        <button
                            key={branch.id}
                            onClick={() => onSelectBranch(branch.id)}
                            title={branch.name}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                currentBranchId === branch.id
                                    ? "bg-primary shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            )}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className={cn(
            "h-full bg-sidebar flex flex-col",
            isMobile ? "w-full" : "w-[280px] border-l border-sidebar-border"
        )}>
            {!isMobile && (
                <div className="h-14 px-4 flex items-center justify-between border-b border-sidebar-border">
                    <div className="flex items-center gap-2">
                        <BranchIcon className="h-3.5 w-3.5 text-primary/50" />
                        <span className="font-semibold text-xs tracking-wide uppercase text-muted-foreground">Branches</span>
                        <span className="text-[10px] text-muted-foreground/50 font-mono ml-1">{branches.length}</span>
                    </div>
                    <Button variant="ghost" size="icon" asChild onClick={onToggleCollapse} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <PanelCloseIcon className="h-3.5 w-3.5" />
                        </motion.button>
                    </Button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto overflow-x-hidden nexus-scroll p-3">
                {branches.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <BranchIcon className="h-6 w-6 mx-auto mb-2" />
                        <p className="text-xs">No branches yet</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {mainBranch && (
                            <motion.div variants={treeItemVariants} initial="hidden" animate="visible" custom={0}>
                                <div className="group relative flex items-center">
                                    <button
                                        onClick={() => onSelectBranch(mainBranch.id)}
                                        className={cn(
                                            "flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left transition-all duration-200 border overflow-hidden",
                                            currentBranchId === mainBranch.id
                                                ? "bg-primary/10 border-primary/25 text-primary neon-glow"
                                                : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-2 h-2 rounded-full shrink-0 transition-all",
                                            currentBranchId === mainBranch.id
                                                ? "bg-primary shadow-[0_0_6px_rgba(45,212,191,0.5)]"
                                                : "bg-muted-foreground/30"
                                        )} />
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-[13px] font-mono flex items-center gap-2",
                                                currentBranchId === mainBranch.id ? "font-semibold" : "font-normal"
                                            )}>
                                                main
                                            </p>
                                        </div>
                                        {currentBranchId === mainBranch.id && (
                                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-primary/60 font-mono">
                                                HEAD
                                            </span>
                                        )}
                                    </button>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {childBranches.filter((b) => b.parentBranchId === mainBranch.id).length > 0 && (
                                        <div className="relative ml-4 mt-1 pl-4 space-y-0.5 overflow-hidden">
                                            <motion.div
                                                initial={{ scaleY: 0 }}
                                                animate={{ scaleY: 1 }}
                                                transition={{ duration: 0.4, ease: "circOut" }}
                                                className="absolute left-[7px] top-0 bottom-0 w-px bg-primary/20 origin-top"
                                            />
                                            {childBranches
                                                .filter((b) => b.parentBranchId === mainBranch.id)
                                                .map((branch, i) => (
                                                    <BranchNode
                                                        key={branch.id}
                                                        branch={branch}
                                                        allBranches={branches}
                                                        currentBranchId={currentBranchId}
                                                        onSelectBranch={onSelectBranch}
                                                        onDeleteBranch={onDeleteBranch}
                                                        onMergeBranch={onMergeBranch}
                                                        depth={1}
                                                        index={i + 1}
                                                    />
                                                ))}
                                        </div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-sidebar-border flex items-center gap-4 text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_4px_rgba(45,212,191,0.4)]" />
                    <span>Active</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    <span>Branch</span>
                </div>
            </div>
        </div>
    );
});

const BranchNode = memo(function BranchNode({
    branch,
    allBranches,
    currentBranchId,
    onSelectBranch,
    onDeleteBranch,
    onMergeBranch,
    depth,
    index,
}: {
    branch: { id: string; name: string; parentBranchId: string | null; messageCount?: number; isMerged?: boolean };
    allBranches: { id: string; name: string; parentBranchId: string | null; isMerged?: boolean }[];
    currentBranchId: string | null;
    onSelectBranch: (id: string) => void;
    onDeleteBranch: (id: string) => void;
    onMergeBranch?: (id: string) => void;
    depth: number;
    index: number;
}) {
    const childBranches = useMemo(() => allBranches.filter((b) => b.parentBranchId === branch.id), [allBranches, branch.id]);
    const branchLabel = branch.name.startsWith("Branch ") ? `#${branch.name.slice(-6)}` : branch.name;
    const isMain = branch.name === "main";
    const isActive = currentBranchId === branch.id;

    return (
        <motion.div
            variants={treeItemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.95 }}
            custom={index}
            layout
        >
            <div className="relative group/node">
                <svg className="absolute -left-4 top-0 w-5 h-[calc(50%+14px)] pointer-events-none overflow-visible" fill="none">
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.4, delay: index * 0.04, ease: "easeInOut" }}
                        d="M 0,-14 L 0,4 Q 0,12 10,12"
                        stroke={isActive ? "#2dd4bf" : "rgba(45,212,191,0.2)"}
                        strokeWidth={isActive ? 1.5 : 1}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="flex items-center gap-1 overflow-hidden">
                    <button
                        onClick={() => onSelectBranch(branch.id)}
                        className={cn(
                            "flex-1 min-w-0 flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left transition-all text-[13px] border overflow-hidden",
                            isActive
                                ? "bg-primary/10 border-primary/20 text-primary"
                                : "hover:bg-muted border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <div className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0 transition-all",
                            isActive ? "bg-primary shadow-[0_0_6px_rgba(45,212,191,0.5)]" : branch.isMerged ? "bg-[#a78bfa]/50" : "bg-muted-foreground/30"
                        )} />
                        <span className={cn(
                            "font-mono truncate text-[11px] flex-1 min-w-0 block",
                            branch.isMerged && "text-muted-foreground line-through"
                        )}>
                            {branchLabel}
                        </span>
                    </button>

                    {!isMain && (
                        <div className={cn(
                            "flex items-center gap-0.5 ml-0.5 shrink-0 transition-opacity p-0.5 rounded-md",
                            isActive ? "opacity-100" : "opacity-0 group-hover/node:opacity-100"
                        )}>
                            {onMergeBranch && !branch.isMerged && branch.parentBranchId && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onMergeBranch(branch.id); }}
                                    disabled={!isActive}
                                    title="Merge into parent"
                                    className={cn(
                                        "h-5 w-5 flex items-center justify-center rounded transition-colors",
                                        isActive ? "text-[#a78bfa]/70 hover:text-[#a78bfa] hover:bg-[#a78bfa]/10" : "text-muted-foreground/20 cursor-not-allowed"
                                    )}
                                >
                                    <MergeIcon className="h-3 w-3" />
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); onDeleteBranch(branch.id); }}
                                title="Delete branch"
                                className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <DeleteIcon className="h-3 w-3" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence mode="popLayout">
                {childBranches.length > 0 && depth < 3 && (
                    <div className="relative ml-3 mt-0.5 pl-3 space-y-0.5">
                        <motion.div
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.04, ease: "circOut" }}
                            className="absolute left-[5px] top-0 bottom-0 w-px bg-primary/15 origin-top"
                        />
                        {childBranches.map((child, i) => (
                            <BranchNode
                                key={child.id}
                                branch={child}
                                allBranches={allBranches}
                                currentBranchId={currentBranchId}
                                onSelectBranch={onSelectBranch}
                                onDeleteBranch={onDeleteBranch}
                                onMergeBranch={onMergeBranch}
                                depth={depth + 1}
                                index={index + i + 1}
                            />
                        ))}
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});
