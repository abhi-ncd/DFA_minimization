import React, { useState } from 'react';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { Key } from './ui';
import { isSoundOn, setSoundOn, tick } from '../utils/sound';

export const SKINS = ['ember', 'volt', 'ultra', 'ice'] as const;
export type Skin = (typeof SKINS)[number];

const SWATCH: Record<Skin, string> = {
  ember: 'linear-gradient(180deg,#ff9c6c,#ff6a2b)',
  volt: 'linear-gradient(180deg,#e6ff9c,#cdff3a)',
  ultra: 'linear-gradient(180deg,#bcaaff,#8b6cff)',
  ice: 'linear-gradient(180deg,#9cecff,#40d6ff)',
};

interface HeaderProps {
  skin: Skin;
  onSkinChange: (skin: Skin) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({ skin, onSkinChange, onReset }) => {
  const [sound, setSound] = useState(isSoundOn());

  return (
    <header className="sticky top-0 z-40 bg-bg/75 backdrop-blur-xl border-b border-line/50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 sm:h-[76px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden
            className="key key-accent w-10 h-10 sm:w-11 sm:h-11 rounded-2xl grid place-items-center font-mono text-xl font-bold pointer-events-none shrink-0"
          >
            δ
          </div>
          <div className="min-w-0 sr-only min-[440px]:not-sr-only">
            <h1 className="text-lg sm:text-[22px] font-extrabold tracking-[-0.02em] leading-none">DFA Minimizer</h1>
            <p className="text-xs text-muted mt-1 hidden sm:block truncate">Partition refinement, one step at a time</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="well flex items-center gap-1.5 p-1.5 rounded-2xl" role="radiogroup" aria-label="Color skin">
            {SKINS.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={skin === s}
                aria-label={`${s} skin`}
                title={s}
                data-on={skin === s || undefined}
                onClick={() => {
                  tick('low');
                  onSkinChange(s);
                }}
                className="swatch w-6 h-6 sm:w-7 sm:h-7 rounded-[10px]"
                style={{ background: SWATCH[s] }}
              />
            ))}
          </div>

          <Key
            size="icon"
            on={sound}
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

          <Key size="md" onClick={onReset} title="Load the standard example">
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </Key>
        </div>
      </div>
    </header>
  );
};
