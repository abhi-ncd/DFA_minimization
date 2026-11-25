import React, { useState } from 'react';
import { DFA, SimulationResult } from '../types/dfa';
import { compareDFAs } from '../utils/dfaUtils';
import { Dices } from 'lucide-react';
import { Plate, Key, Led, StateChip, Verdict } from './ui';
import { tick } from '../utils/sound';

interface StringSimulatorProps {
  originalDFA: DFA;
  minimizedDFA: DFA;
  initialStrings?: string[];
}

const show = (s: string) => (s === '' ? 'ε' : s);

export const StringSimulator: React.FC<StringSimulatorProps> = ({
  originalDFA,
  minimizedDFA,
  initialStrings = ['01', '101', '00', '110', '011'],
}) => {
  const [input, setInput] = useState(initialStrings.join(', '));
  const [active, setActive] = useState<string>(initialStrings[0] ?? '');

  const parsed = input
    .split(/[, space\s]+/)
    .map(s => s.trim())
    .filter(s => s !== '');
  const strings = parsed.length > 0 ? parsed : [''];

  const results = compareDFAs(originalDFA, minimizedDFA, strings);
  const agree = results.filter(r => r.match).length;
  const allMatch = agree === results.length;
  const selected = results.find(r => r.inputString === active) ?? results[0];

  const shuffle = () => {
    const alphabet = originalDFA.alphabet.length > 0 ? originalDFA.alphabet : ['0', '1'];
    const list: string[] = [];
    for (let i = 0; i < 7; i++) {
      const len = Math.floor(Math.random() * 6) + 1;
      let s = '';
      for (let j = 0; j < len; j++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
      list.push(s);
    }
    const unique = Array.from(new Set(list));
    setInput(unique.join(', '));
    setActive(unique[0] ?? '');
  };

  return (
    <Plate
      index="04"
      title="Simulate"
      subtitle="Run strings through both machines. If every verdict agrees, you have evidence the languages match."
      actions={
        <Key onClick={shuffle}>
          <Dices className="w-4 h-4" />
          Shuffle
        </Key>
      }
    >
      <label htmlFor="sim-strings" className="caps block mb-2">Test strings</label>
      <input
        id="sim-strings"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="01, 101, 00"
        spellCheck={false}
        className="field h-14 w-full text-lg"
      />

      {/* Verdict */}
      <div className="display mt-5 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Led tone={allMatch ? 'ok' : 'bad'} />
          <div>
            <div className={`text-3xl sm:text-4xl font-extrabold tracking-[-0.02em] leading-none ${allMatch ? 'text-ok' : 'text-bad'}`}>
              {allMatch ? 'Equivalent' : 'Mismatch'}
            </div>
            <div className="mt-2 text-sm text-muted">
              {agree} of {results.length} {results.length === 1 ? 'string agrees' : 'strings agree'}
            </div>
          </div>
        </div>
        <div className="font-mono text-xl sm:text-2xl font-bold">
          L(M) <span className={allMatch ? 'text-ok' : 'text-bad'}>{allMatch ? '=' : '≠'}</span> L(M′)
        </div>
      </div>

      {/* Results */}
      <div className="mt-6">
        <div className="hidden sm:grid grid-cols-[minmax(0,1fr)_110px_110px_56px] gap-3 px-4 mb-2">
          <span className="caps">String</span>
          <span className="caps">Original</span>
          <span className="caps">Minimized</span>
          <span className="caps text-center">Match</span>
        </div>
        <div className="space-y-2">
          {results.map((r, idx) => {
            const on = selected?.inputString === r.inputString;
            return (
              <button
                key={idx}
                type="button"
                aria-pressed={on}
                onClick={() => {
                  tick('low');
                  setActive(r.inputString);
                }}
                className={`well w-full text-left grid grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:grid-cols-[minmax(0,1fr)_110px_110px_56px] items-center gap-2 sm:gap-3 px-4 py-2.5 transition ${
                  on ? 'ring-2 ring-accent shadow-[0_0_22px_-6px_rgb(var(--accent)/0.6)]' : 'hover:ring-1 hover:ring-line'
                }`}
              >
                <span className="font-mono text-base font-bold truncate">{show(r.inputString)}</span>
                <span><Verdict accepted={r.originalResult.isAccepted} /></span>
                <span><Verdict accepted={r.minimizedResult.isAccepted} /></span>
                <span className="flex justify-center" aria-label={r.match ? 'Match' : 'Mismatch'}>
                  <Led tone={r.match ? 'ok' : 'bad'} />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Trace */}
      {selected && (
        <div className="mt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <span className="caps">Trace</span>
            <span className="font-mono text-sm">
              <span className="text-muted">input </span>
              <span className="font-bold">"{show(selected.inputString)}"</span>
            </span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Lane title="Original" result={selected.originalResult} />
            <Lane title="Minimized" result={selected.minimizedResult} />
          </div>
        </div>
      )}
    </Plate>
  );
};

const Lane: React.FC<{ title: string; result: SimulationResult }> = ({ title, result }) => {
  const lastIdx = result.path.length - 1;
  return (
    <div className="well p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-bold">{title}</span>
        <Verdict accepted={result.isAccepted} />
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {result.path.map((st, i) => (
          <React.Fragment key={i}>
            <StateChip name={st} color={i === lastIdx ? (result.isAccepted ? 'var(--ok)' : 'var(--bad)') : undefined} />
            {i < result.trace.length && (
              <span className="inline-flex items-center gap-1 px-1 font-mono text-xs text-muted">
                <span className="text-accent font-bold">{result.trace[i].symbol}</span>
                <span aria-hidden>→</span>
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      {!result.isValidAlphabet && (
        <p className="mt-3 text-[13px] text-warn">{result.executionMessage}</p>
      )}
    </div>
  );
};
