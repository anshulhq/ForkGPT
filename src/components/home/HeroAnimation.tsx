"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Node {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    r: number;
    pulse: number;
}

function generateNodes(): Node[] {
    const n: Node[] = [];
    for (let i = 0; i < 20; i++) {
        n.push({
            id: i,
            x: 50 + Math.random() * 500,
            y: 30 + Math.random() * 200,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: Math.random() * 2 + 1,
            pulse: Math.random() * Math.PI * 2,
        });
    }
    return n;
}

export function HeroAnimation() {
    const [tick, setTick] = useState(0);
    const [nodes] = useState(generateNodes);
    const mounted = tick > 0;

    useEffect(() => {
        const interval = setInterval(() => {
            setTick(t => t + 1);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const animatedNodes = tick === 0 && !mounted ? nodes : nodes.map(node => {
        const nx = node.x + Math.sin(tick * 0.02 + node.pulse) * 8;
        const ny = node.y + Math.cos(tick * 0.015 + node.pulse) * 6;
        return { ...node, x: nx, y: ny };
    });

    const connections: { from: number; to: number; opacity: number }[] = [];
    for (let i = 0; i < animatedNodes.length; i++) {
        for (let j = i + 1; j < animatedNodes.length; j++) {
            const dx = animatedNodes[i].x - animatedNodes[j].x;
            const dy = animatedNodes[i].y - animatedNodes[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                connections.push({
                    from: i,
                    to: j,
                    opacity: 1 - dist / 120,
                });
            }
        }
    }

    return (
        <div className="relative w-full max-w-xl mx-auto h-[250px] flex items-center justify-center overflow-hidden">
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    background: "radial-gradient(ellipse at center, rgba(45, 212, 191, 0.06) 0%, transparent 70%)"
                }}
            />

            <svg
                width="100%"
                height="100%"
                viewBox="0 0 600 260"
                fill="none"
                className="overflow-visible"
            >
                {connections.map((conn, i) => (
                    <line
                        key={`${conn.from}-${conn.to}-${i}`}
                        x1={animatedNodes[conn.from].x}
                        y1={animatedNodes[conn.from].y}
                        x2={animatedNodes[conn.to].x}
                        y2={animatedNodes[conn.to].y}
                        stroke="#2dd4bf"
                        strokeWidth={0.5}
                        opacity={conn.opacity * 0.15}
                    />
                ))}

                {animatedNodes.map((node, i) => {
                    const glowIntensity = Math.sin(tick * 0.03 + node.pulse) * 0.5 + 0.5;
                    return (
                        <g key={node.id}>
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={node.r + 4}
                                fill="#2dd4bf"
                                opacity={glowIntensity * 0.06}
                            />
                            <circle
                                cx={node.x}
                                cy={node.y}
                                r={node.r}
                                fill={i < 3 ? "#2dd4bf" : "#818cf8"}
                                opacity={i < 3 ? 0.6 + glowIntensity * 0.3 : 0.2 + glowIntensity * 0.15}
                            />
                            {i < 3 && (
                                <circle
                                    cx={node.x}
                                    cy={node.y}
                                    r={1}
                                    fill="white"
                                    opacity={0.8}
                                />
                            )}
                        </g>
                    );
                })}

                {mounted && (
                    <motion.g
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1, duration: 1 }}
                    >
                        <text
                            x="300"
                            y="240"
                            textAnchor="middle"
                            className="fill-muted-foreground/15 font-mono text-[10px] uppercase tracking-[0.3em]"
                        >
                            neural graph
                        </text>
                    </motion.g>
                )}
            </svg>
        </div>
    );
}
