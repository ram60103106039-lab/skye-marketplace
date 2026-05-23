import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2, Cpu, Zap, Search, MapPin, Star, Trophy } from 'lucide-react';
import type { MatchingStep } from '../lib/webhook';
import { MATCHING_STEPS } from '../lib/webhook';

type Props = {
  steps?: MatchingStep[];
  onComplete?: () => void;
};

const STEP_ICONS = [Cpu, Search, Zap, MapPin, Star];

export function MatchingProgress({ steps = MATCHING_STEPS, onComplete }: Props) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let idx = 0;
    let cancelled = false;

    function advance() {
      if (cancelled || idx >= steps.length) {
        if (!cancelled) {
          setDone(true);
          onComplete?.();
        }
        return;
      }
      setCurrentStep(idx);
      const delay = steps[idx].durationMs;
      setTimeout(() => {
        if (cancelled) return;
        setCompletedSteps((prev) => [...prev, idx]);
        idx++;
        advance();
      }, delay);
    }

    // Small lead-in delay
    const t = setTimeout(advance, 200);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-900/90 overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-slate-800/60 border-b border-slate-700/40">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wide">MILO MATCHING ENGINE v2.1</span>
        {done && (
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-400 font-medium">
            <Trophy className="w-3 h-3" /> Complete
          </span>
        )}
      </div>

      <div className="p-4 space-y-2.5 font-mono text-xs">
        {steps.map((step, idx) => {
          const isComplete = completedSteps.includes(idx);
          const isActive = idx === currentStep && !isComplete;
          const isPending = idx > currentStep;
          const Icon = STEP_ICONS[idx] ?? Cpu;

          return (
            <div
              key={idx}
              className={`flex items-start gap-3 transition-all duration-500 ${isPending ? 'opacity-25' : 'opacity-100'}`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {isComplete ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center">
                    <Icon className="w-2.5 h-2.5 text-slate-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`font-semibold ${isComplete ? 'text-slate-300' : isActive ? 'text-cyan-300' : 'text-slate-600'}`}>
                  {step.label}
                  {isActive && <span className="animate-pulse text-cyan-400">_</span>}
                </span>
                <p className={`text-[10px] mt-0.5 ${isComplete ? 'text-slate-500' : isActive ? 'text-slate-400' : 'text-slate-700'}`}>
                  {step.detail}
                </p>
              </div>
              {isComplete && (
                <span className="text-[10px] text-emerald-500 font-medium flex-shrink-0">done</span>
              )}
            </div>
          );
        })}

        {done && (
          <div className="mt-3 pt-3 border-t border-slate-700/40 flex items-center gap-2 text-emerald-400">
            <Trophy className="w-4 h-4" />
            <span className="font-semibold">Matches found — presenting results...</span>
          </div>
        )}
      </div>
    </div>
  );
}
