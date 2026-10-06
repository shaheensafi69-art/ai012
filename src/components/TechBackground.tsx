"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface TechBackgroundProps {
  variant?: 'default' | 'amber' | 'emerald' | 'blue' | 'pink' | 'purple' | 'cyan';
  className?: string;
}

export default function TechBackground({ variant = 'default', className = '' }: TechBackgroundProps) {
  // Theme color definitions for professional, subtle ambient glows
  const themeGlows: Record<string, { primary: string; secondary: string; accent: string }> = {
    default: {
      primary: 'rgba(212, 175, 55, 0.12)', // Subtle Gold/Amber
      secondary: 'rgba(99, 102, 241, 0.10)', // Deep Indigo
      accent: 'rgba(59, 130, 246, 0.08)',
    },
    amber: {
      primary: 'rgba(245, 158, 11, 0.14)',
      secondary: 'rgba(217, 119, 6, 0.10)',
      accent: 'rgba(251, 191, 36, 0.08)',
    },
    emerald: {
      primary: 'rgba(16, 185, 129, 0.14)',
      secondary: 'rgba(5, 150, 105, 0.10)',
      accent: 'rgba(52, 211, 153, 0.08)',
    },
    blue: {
      primary: 'rgba(59, 130, 246, 0.14)',
      secondary: 'rgba(37, 99, 235, 0.10)',
      accent: 'rgba(96, 165, 250, 0.08)',
    },
    pink: {
      primary: 'rgba(236, 72, 153, 0.14)',
      secondary: 'rgba(219, 39, 119, 0.10)',
      accent: 'rgba(244, 114, 182, 0.08)',
    },
    purple: {
      primary: 'rgba(168, 85, 247, 0.14)',
      secondary: 'rgba(147, 51, 234, 0.10)',
      accent: 'rgba(192, 132, 252, 0.08)',
    },
    cyan: {
      primary: 'rgba(6, 182, 212, 0.14)',
      secondary: 'rgba(8, 145, 178, 0.10)',
      accent: 'rgba(34, 211, 238, 0.08)',
    },
  };

  const currentTheme = themeGlows[variant] || themeGlows.default;

  return (
    <div className={`fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#030305] ${className}`}>
      {/* 1. Ultra-subtle geometric grid with radial mask */}
      <div 
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%, black 20%, transparent 80%)'
        }}
      />

      {/* 2. Top-center executive ambient light beam */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] opacity-40 blur-[140px] pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${currentTheme.primary} 0%, ${currentTheme.secondary} 45%, transparent 75%)`
        }}
      />

      {/* 3. Soft animated ambient flares */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
          x: [-20, 20, -20],
          y: [-10, 15, -10]
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-[10%] -left-[10%] w-[650px] h-[650px] rounded-full blur-[160px]"
        style={{ background: currentTheme.primary }}
      />

      <motion.div
        animate={{
          scale: [1.1, 0.95, 1.1],
          opacity: [0.3, 0.5, 0.3],
          x: [20, -20, 20],
          y: [15, -15, 15]
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-[40%] -right-[10%] w-[600px] h-[600px] rounded-full blur-[170px]"
        style={{ background: currentTheme.secondary }}
      />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.35, 0.2]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -bottom-[10%] left-[25%] w-[700px] h-[500px] rounded-full blur-[180px]"
        style={{ background: currentTheme.accent }}
      />

      {/* 4. Fine starlight micro-dust (subtle, non-distracting) */}
      <div 
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '90px 90px'
        }}
      />

      {/* 5. Vignette border for cinematic focus */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />
    </div>
  );
}
