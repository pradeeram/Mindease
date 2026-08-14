import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const PageTransition: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

export const FadeIn: React.FC<{
  children: React.ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  className?: string;
}> = ({ children, delay = 0, direction = 'up', className = '' }) => {
  const getInitialPosition = () => {
    switch (direction) {
      case 'up': return { opacity: 0, y: 16 };
      case 'down': return { opacity: 0, y: -16 };
      case 'left': return { opacity: 0, x: 16 };
      case 'right': return { opacity: 0, x: -16 };
      default: return { opacity: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialPosition()}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  staggerDelay?: number;
  className?: string;
}> = ({ children, staggerDelay = 0.08, className = '' }) => (
  <motion.div
    initial="hidden"
    animate="show"
    variants={{
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
        },
      },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 12 },
      show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
    }}
    className={className}
  >
    {children}
  </motion.div>
);

export const HoverCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
  children,
  className = '',
  onClick
}) => (
  <motion.div
    whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
    whileTap={{ scale: 0.99 }}
    className={className}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

export const BreathingOrb: React.FC<{ phase: 'INHALE' | 'HOLD' | 'EXHALE' | 'REST'; secondsLeft: number }> = ({ phase, secondsLeft }) => {
  const getScale = () => {
    switch (phase) {
      case 'INHALE': return 1.35;
      case 'HOLD': return 1.35;
      case 'EXHALE': return 1.0;
      case 'REST': return 1.0;
    }
  };

  const getDuration = () => {
    switch (phase) {
      case 'INHALE': return 4;
      case 'HOLD': return 7;
      case 'EXHALE': return 8;
      case 'REST': return 2;
    }
  };

  return (
    <div className="relative flex items-center justify-center w-64 h-64 mx-auto my-8">
      {/* Outer Pulse Ring */}
      <motion.div
        animate={{ scale: getScale() * 1.15, opacity: phase === 'HOLD' ? 0.35 : 0.15 }}
        transition={{ duration: getDuration(), ease: 'easeInOut' }}
        className="absolute inset-0 rounded-full bg-sage-accent filter blur-xl"
      />

      {/* Main Therapeutic Orb */}
      <motion.div
        animate={{ scale: getScale() }}
        transition={{ duration: getDuration(), ease: 'easeInOut' }}
        className="w-48 h-48 rounded-full bg-gradient-to-tr from-slate-deep via-clinical-blue to-sage-accent flex flex-col items-center justify-center text-white shadow-lg shadow-clinical-blue/20"
      >
        <span className="text-xs uppercase tracking-widest font-semibold text-sage-muted">
          {phase}
        </span>
        <span className="text-4xl font-serif font-bold mt-1">
          {secondsLeft}s
        </span>
        <span className="text-xs text-bone-white/80 mt-1">
          {phase === 'INHALE' && 'Breathe In Slowly'}
          {phase === 'HOLD' && 'Hold Gently'}
          {phase === 'EXHALE' && 'Release Smoothly'}
          {phase === 'REST' && 'Rest'}
        </span>
      </motion.div>
    </div>
  );
};
