import React from 'react';
import { PRESET_DFAS } from '../utils/dfaUtils';
import { PresetTestCase } from '../types/dfa';
import { tick } from '../utils/sound';

interface TestPresetsProps {
  currentPresetId?: string;
  onSelectPreset: (preset: PresetTestCase) => void;
}

export const TestPresets: React.FC<TestPresetsProps> = ({ currentPresetId, onSelectPreset }) => {
  return (
    <section className="plate p-5 sm:p-7">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <span className="caps">Examples</span>
          <h2 className="mt-3 text-[26px] sm:text-[32px] font-black tracking-[-0.045em] leading-[1.02]">Pick a machine</h2>
        </div>
        <span className="caps">{PRESET_DFAS.length} presets</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-3.5">
        {PRESET_DFAS.map((preset) => {
          const on = currentPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              title={preset.description}
              aria-pressed={on}
              data-on={on || undefined}
              onClick={() => {
                tick('low');
                onSelectPreset(preset);
              }}
              className="key rounded-[22px] p-3.5 sm:p-4 text-left flex flex-col justify-between gap-4 min-h-[104px]"
            >
              <span className="text-[14px] sm:text-[15px] font-extrabold tracking-[-0.02em] leading-snug text-ink">
                {preset.name}
              </span>
              <span className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.06em] tabular-nums text-muted">
                <span>
                  {preset.dfa.states.length} → <span className={on ? 'text-accent font-bold' : 'text-ink font-bold'}>{preset.expectedStateCount}</span>
                </span>
                <span>|Σ| {preset.dfa.alphabet.length}</span>
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
