import React, { useState } from 'react';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Key } from './ui';
import { isSoundOn, setSoundOn, tick } from '../utils/sound';

export const SKINS = ['day', 'night'] as const;
export type Skin = (typeof SKINS)[number];

const SKIN_LABEL: Record<Skin, string> = {
  day: 'Day',
  night: 'Night',
};

interface HeaderProps {
  skin: Skin;
  onSkinChange: (skin: Skin) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ skin, onSkinChange, onReset }) => {
  const [sound, setSound] = useState(isSoundOn());

  return (
    <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur-xl">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 sm:h-[76px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-accent text-accent-ink grid place-items-center text-[22px] font-black pointer-events-none shrink-0"
          >
            δ
          </div>
          <div className="min-w-0 sr-only min-[440px]:not-sr-only">
            <h1 className="text-[20px] sm:text-[24px] font-black tracking-[-0.04em] leading-none">DFA Minimizer</h1>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-muted mt-1.5 hidden sm:block truncate">
              Partition refinement · one step at a time
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="inline-flex p-1 gap-1 rounded-full bg-plate" role="radiogroup" aria-label="Color skin">
            {SKINS.map((s) => {
              const on = skin === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  aria-label={`${SKIN_LABEL[s]} skin`}
                  title={SKIN_LABEL[s]}
                  onClick={() => {
                    if (on) return;
                    tick('low');
                    onSkinChange(s);
                  }}
                  className={`h-9 px-3 sm:px-4 rounded-full font-mono text-[11px] font-medium uppercase tracking-[0.1em] transition-colors ${
                    on ? 'seg-on' : 'text-muted hover:text-ink'
                  }`}
                >
                  {SKIN_LABEL[s]}
                </button>
              );
            })}
          </div>

          <Key
            size="icon"
            on={sound}
            className={sound ? '' : 'bg-plate hover:bg-plate-hi'}
            aria-label={sound ? 'Turn sound off' : 'Turn sound on'}
            title={sound ? 'Sound on' : 'Sound off'}
            onClick={() => {
              const next = !sound;
              setSoundOn(next);
              setSound(next);
              if (next) tick('high');
            }}
          >
            {sound ? <Volume2 className="w-[18px] h-[18px]" /> : <VolumeX className="w-[18px] h-[18px]" />}
          </Key>

          <Key size="md" className="bg-plate hover:bg-plate-hi" onClick={onReset} title="Load the standard example">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </Key>
        </div>
      </div>
    </header>
  );
};
