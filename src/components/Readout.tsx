import React from 'react';
import { ArrowRight } from 'lucide-react';
import { MinimizationResult } from '../types/dfa';
import { Led } from './ui';

interface ReadoutProps {
  result: MinimizationResult | null;
  title: string;
  description: string;
}

export const Readout: React.FC<ReadoutProps> = ({ result, title, description }) => {
  const before = result?.originalDFA.states.length;
  const after = result?.minimizedDFA.states.length;
  const removed = result?.unreachableStates.length ?? 0;
  const merged = result ? result.reachableStates.length - result.minimizedDFA.states.length : 0;
  const rounds = result ? result.steps.filter((s) => s.type === 'refinement' || s.type === 'completed').length : 0;
  const saved = before && after !== undefined ? Math.round((1 - after / before) * 100) : 0;

  const stats = [
    { label: 'Removed', value: removed },
    { label: 'Merged', value: merged },
    { label: 'Rounds', value: rounds },
  ];

  return (
    <section className="plate p-5 sm:p-7 flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <span className="caps">Loaded</span>
        <span className="flex items-center gap-2 text-xs font-semibold text-muted">
          <Led tone={result ? 'ok' : 'bad'} />
          {result ? 'Minimized' : 'Needs fixing'}
        </span>
      </div>
      <h2 className="mt-3 text-[26px] sm:text-[32px] font-black tracking-[-0.045em] leading-[1.02]">{title}</h2>
      <p className="mt-2 font-mono text-[12px] uppercase tracking-[0.06em] text-muted leading-relaxed">{description}</p>

      <div className="display mt-6 p-5 sm:p-6 flex items-end justify-between gap-4">
        <div>
          <div className="caps">States</div>
          <div className="mt-3 flex items-center gap-3 sm:gap-4 tabular-nums leading-none">
            <span className="font-num text-5xl sm:text-6xl font-semibold text-muted">{before ?? '?'}</span>
            <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7 text-muted" strokeWidth={2.5} />
            <span className="font-hero text-[88px] sm:text-[112px] leading-[0.9] extrude">{after ?? '?'}</span>
          </div>
        </div>
        <div className="text-right pb-1">
          <div className="caps">Smaller</div>
          <div className="mt-2 font-num text-4xl sm:text-5xl font-semibold tabular-nums leading-none">{result ? `${saved}%` : '?'}</div>
        </div>
      </div>

      <dl className="grid grid-cols-3 gap-3 mt-4">
        {stats.map((s) => (
          <div key={s.label} className="well rounded-[22px] px-3 sm:px-4 py-3.5 min-w-0">
            <dt className="caps tracking-[0.1em] truncate" title={s.label}>{s.label}</dt>
            <dd className="mt-1.5 font-num text-[34px] font-semibold tabular-nums leading-none">{result ? s.value : '?'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
