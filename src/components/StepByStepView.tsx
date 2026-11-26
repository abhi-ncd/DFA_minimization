import React, { useState, useEffect } from 'react';
import { MinimizationResult } from '../types/dfa';
import { ChevronLeft, ChevronRight, RotateCcw, Play, Pause, ArrowRight } from 'lucide-react';
import { Plate, Key, Led, StateChip, groupColor } from './ui';
import { tick } from '../utils/sound';

interface StepByStepViewProps {
  minimizationResult: MinimizationResult;
  currentStepIndex: number;
  onStepChange: (index: number) => void;
}

const TYPE_LABEL: Record<string, string> = {
  reachability: 'Reachability',
  initial_partition: 'Initial split',
  refinement: 'Refinement',
  completed: 'Stable',
};

export const StepByStepView: React.FC<StepByStepViewProps> = ({
  minimizationResult,
  currentStepIndex,
  onStepChange,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const steps = minimizationResult.steps;
  const step = steps[currentStepIndex] || steps[0];
  const last = steps.length - 1;
  const alphabet = minimizationResult.originalDFA.alphabet;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      if (currentStepIndex >= last) {
        setIsPlaying(false);
      } else {
        tick('low');
        onStepChange(currentStepIndex + 1);
      }
    }, 1400);
    return () => clearInterval(timer);
  }, [isPlaying, last, currentStepIndex, onStepChange]);

  if (!step) return null;

  const title = step.title.replace(/^\d+\.\s*/, '');
  // Signatures are computed against the classes before this round's split
  const signatureBase =
    step.type === 'refinement' ? steps[currentStepIndex - 1]?.partitions ?? step.partitions : step.partitions;
  const groupOf = (state: string) => signatureBase.findIndex(g => g.includes(state));

  return (
    <Plate
      index="03"
      title="Refine"
      subtitle="Split states into accepting and non-accepting, then keep splitting any class whose members disagree about where their transitions land."
    >
      {/* Transport */}
      <div className="display p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-center gap-5 min-w-0">
          <div className="tabular-nums leading-none shrink-0">
            <span className="font-hero text-6xl sm:text-7xl extrude">{currentStepIndex + 1}</span>
            <span className="font-num text-2xl sm:text-3xl font-semibold text-muted ml-1">/{steps.length}</span>
          </div>
          <div className="min-w-0">
            <div className="caps">{TYPE_LABEL[step.type] ?? step.type}</div>
            <div className="mt-1.5 text-xl sm:text-2xl font-black tracking-[-0.035em] leading-tight">{title}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <Key size="icon" onClick={() => { setIsPlaying(false); onStepChange(0); }} disabled={currentStepIndex === 0} aria-label="First step">
            <RotateCcw className="w-4 h-4" />
          </Key>
          <Key size="icon" onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))} disabled={currentStepIndex === 0} aria-label="Previous step">
            <ChevronLeft className="w-5 h-5" />
          </Key>
          <Key
            tone="accent"
            size="lg"
            className="w-28"
            on={isPlaying}
            onClick={() => {
              if (!isPlaying && currentStepIndex >= last) onStepChange(0);
              setIsPlaying(!isPlaying);
            }}
          >
            {isPlaying ? <Pause className="w-4 h-4" fill="currentColor" /> : <Play className="w-4 h-4" fill="currentColor" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Key>
          <Key size="icon" onClick={() => onStepChange(Math.min(last, currentStepIndex + 1))} disabled={currentStepIndex === last} aria-label="Next step">
            <ChevronRight className="w-5 h-5" />
          </Key>
        </div>
      </div>

      {/* Progress segments */}
      <div className="mt-4 flex gap-1.5" role="tablist" aria-label="Steps">
        {steps.map((s, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === currentStepIndex}
            aria-label={`Step ${i + 1}: ${s.title.replace(/^\d+\.\s*/, '')}`}
            onClick={() => {
              tick('low');
              onStepChange(i);
            }}
            className="flex-1 py-2 group"
          >
            <span
              className={`block h-2.5 rounded-full transition-all ${
                i < currentStepIndex ? 'bg-ink' : i === currentStepIndex ? 'bg-accent' : 'bg-plate-hi group-hover:bg-line'
              }`}
            />
          </button>
        ))}
      </div>

      <div key={currentStepIndex} className="animate-rise">
        <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
          <p className="text-[16px] font-medium text-ink/85 leading-relaxed max-w-3xl">{step.description}</p>
          {step.isStable && (
            <span className="inline-flex items-center gap-2.5 h-9 px-4 rounded-full bg-ok font-mono text-[11.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: 'rgb(var(--on-status))' }}>
              <Led tone="ok" />
              Stable, nothing split
            </span>
          )}
        </div>

        {/* Reachability */}
        {step.type === 'reachability' && (
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="well p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <Led tone="ok" />
                <span className="caps">Reachable · {step.reachableStates.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {step.reachableStates.map(st => <StateChip key={st} name={st} />)}
              </div>
            </div>
            <div className="well p-4">
              <div className="flex items-center gap-2.5 mb-3">
                <Led tone={step.unreachableStates.length ? 'bad' : 'muted'} />
                <span className="caps">Unreachable · {step.unreachableStates.length}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {step.unreachableStates.length === 0 ? (
                  <span className="text-sm text-muted">None. Every state can be reached.</span>
                ) : (
                  step.unreachableStates.map(st => <StateChip key={st} name={st} strike />)
                )}
              </div>
            </div>
          </div>
        )}

        {/* Partition classes */}
        {step.partitions.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="caps">Classes</span>
              <span className="caps">{step.partitions.length} blocks</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {step.partitions.map((group, idx) => {
                const c = groupColor(idx);
                return (
                  <div key={idx} className="well rounded-[22px] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="inline-grid place-items-center h-8 min-w-[2.5rem] px-2.5 rounded-full font-num text-lg font-semibold"
                        style={{ background: `rgb(${c})`, color: 'rgb(17 17 17)' }}
                      >
                        P{idx}
                      </span>
                      <span className="caps">{group.length} {group.length === 1 ? 'state' : 'states'}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.map(st => <StateChip key={st} name={st} color={c} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Signatures */}
        {step.signatures && step.signatures.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <span className="caps">Transition signatures</span>
              <span className="text-xs text-muted">
                P numbers name the classes {step.type === 'completed' ? 'above' : 'from the previous step'}. Matching signatures stay together.
              </span>
            </div>
            <div className="well overflow-x-auto p-2">
              <table className="w-full text-sm border-separate border-spacing-y-1 border-spacing-x-0">
                <thead>
                  <tr className="text-left">
                    <th className="caps font-semibold px-3 pb-1">State</th>
                    {alphabet.map(sym => (
                      <th key={sym} className="px-3 pb-1 font-mono text-xs text-muted font-semibold">
                        on <span className="text-ink">{sym}</span>
                      </th>
                    ))}
                    <th className="caps font-semibold px-3 pb-1">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {step.signatures.map(sig => {
                    const g = groupOf(sig.state);
                    return (
                      <tr key={sig.state} className="hover:bg-plate-hi/40">
                        <td className="px-3 py-1 rounded-l-xl">
                          <StateChip name={sig.state} color={g >= 0 ? groupColor(g) : undefined} />
                        </td>
                        {alphabet.map(sym => {
                          const c = groupColor(sig.targetGroupIndices[sym]);
                          return (
                            <td key={sym} className="px-3 py-1 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 font-mono">
                                <span className="text-muted">{sig.targetStates[sym]}</span>
                                <ArrowRight className="w-3 h-3 text-muted/70" />
                                <span
                                  className="inline-flex items-center h-6 px-2.5 rounded-full text-xs font-bold"
                                  style={{ background: `rgb(${c})`, color: 'rgb(17 17 17)' }}
                                >
                                  P{sig.targetGroupIndices[sym]}
                                </span>
                              </span>
                            </td>
                          );
                        })}
                        <td className="px-3 py-1 rounded-r-xl font-mono text-xs text-ink/80 whitespace-nowrap">{sig.signatureKey}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Plate>
  );
};
