import { HelpDialog } from "./HelpDialog";
import { Button } from "@/components/ui/button";
import { PanelCloseIcon } from "@/components/icons/PanelCloseIcon";
import { PanelIcon } from "@/components/icons/PanelIcon";
import { PlusIcon } from "@/components/icons/PlusIcon";
import { ChatIcon } from "@/components/icons/ChatIcon";
import { DeleteIcon } from "@/components/icons/DeleteIcon";
import { MoreIcon } from "@/components/icons/MoreIcon";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface Branch {
    id: string;
    name: string;
    messageCount: number;
    createdAt: Date;
    isMain?: boolean;
    parentBranchId: string | null;
}

interface SidebarProps {
    branches: Branch[];
    currentBranchId: string | null;
    onSelectBranch: (branchId: string) => void;
    onNewChat: () => void;
    onDeleteConversation: (branchId: string) => void;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
    isMobile?: boolean;
}

const itemVariants: Variants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: { delay: i * 0.04, duration: 0.3, ease: "easeOut" }
    })
};

export function Sidebar({
    branches,
    currentBranchId,
    onSelectBranch,
    onNewChat,
    onDeleteConversation,
    isCollapsed = false,
    onToggleCollapse,
    isMobile = false,
}: SidebarProps) {
    return (
        <motion.div
            initial={false}
            animate={{ width: isMobile ? "100%" : (isCollapsed ? 56 : 280) }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
                "h-full bg-sidebar text-sidebar-foreground flex flex-col z-20",
                !isMobile && "border-r border-sidebar-border"
            )}
        >
            <div className="flex flex-col h-full">
                {!isMobile && (
                    <div className="h-14 px-4 flex items-center justify-between border-b border-sidebar-border">
                        <AnimatePresence mode="wait">
                            {!isCollapsed && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2.5 overflow-hidden"
                                >
                                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <span className="text-primary font-bold text-xs">F</span>
                                    </div>
                                    <span className="font-semibold text-sm tracking-tight text-foreground whitespace-nowrap">ForkGPT</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <Button variant="ghost" size="icon" asChild onClick={onToggleCollapse} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                {isCollapsed ? <PanelIcon className="h-3.5 w-3.5" /> : <PanelCloseIcon className="h-3.5 w-3.5" />}
                            </motion.button>
                        </Button>
                    </div>
                )}

                <div className="p-3">
                    <Button
                        onClick={onNewChat}
                        asChild
                        className={cn(
                            "w-full h-9 btn-ghost-neon font-medium text-xs",
                            isCollapsed ? "px-0 justify-center" : "justify-start gap-2.5"
                        )}
                    >
                        <motion.button whileTap={{ scale: 0.97 }}>
                            <PlusIcon className="h-3.5 w-3.5 shrink-0" />
                            {!isCollapsed && <span>New Chat</span>}
                        </motion.button>
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto nexus-scroll px-2 pb-4">
                    <div className="space-y-0.5">
                        {!isCollapsed && (
                            <div className="px-3 py-2">
                                <h3 className="text-[10px] font-medium text-muted-foreground uppercase tracking-[0.15em]">
                                    Conversations
                                </h3>
                            </div>
                        )}
                        {branches.length === 0 && !isCollapsed ? (
                            <p className="text-muted-foreground text-xs px-3 py-2 italic">No conversations yet</p>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {branches.map((branch, i) => (
                                    <motion.div
                                        key={branch.id}
                                        custom={i}
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit={{ opacity: 0, x: -10 }}
                                        layout
                                        className="group relative flex items-center"
                                    >
                                        <button
                                            onClick={() => onSelectBranch(branch.id)}
                                            className={cn(
                                                "flex items-center gap-2.5 px-3 py-2 rounded-lg w-full text-left transition-all duration-200 z-10 relative",
                                                currentBranchId === branch.id
                                                    ? "text-primary"
                                                    : "text-muted-foreground hover:text-foreground",
                                                isCollapsed && "justify-center px-0"
                                            )}
                                            title={isCollapsed ? branch.name : undefined}
                                        >
                                            {currentBranchId === branch.id && (
                                                <motion.div
                                                    layoutId="activeSidebarTab"
                                                    className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-lg -z-10"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                />
                                            )}
                                            <ChatIcon className={cn("h-3.5 w-3.5 shrink-0", currentBranchId === branch.id ? "text-primary" : "opacity-60")} />
                                            {!isCollapsed && (
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn(
                                                        "text-[13px] truncate",
                                                        currentBranchId === branch.id ? "font-medium text-primary" : "font-normal"
                                                    )}>
                                                        {branch.name}
                                                    </p>
                                                </div>
                                            )}
                                            {currentBranchId === branch.id && !isCollapsed && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 animate-glow-pulse" />
                                            )}
                                        </button>

                                        {!isCollapsed && (
                                            <div className={cn(
                                                "absolute right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-20",
                                                currentBranchId === branch.id && "opacity-100"
                                            )}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-foreground">
                                                            <MoreIcon className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-28">
                                                        <DropdownMenuItem
                                                            onClick={(e) => { e.stopPropagation(); onDeleteConversation(branch.id); }}
                                                            className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer text-xs"
                                                        >
                                                            <DeleteIcon className="mr-2 h-3.5 w-3.5" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>

                <div className="p-3 border-t border-sidebar-border">
                    <div className={cn("flex items-center gap-2.5", isCollapsed && "justify-center")}>
                        <div className="w-7 h-7 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-semibold text-muted-foreground">U</span>
                        </div>
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-foreground">User</p>
                                <p className="text-[10px] text-muted-foreground">Free Plan</p>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            {!isCollapsed && <HelpDialog />}
                        </div>
                    </div>

                </div>
            </div>
        </motion.div>
    );
}
