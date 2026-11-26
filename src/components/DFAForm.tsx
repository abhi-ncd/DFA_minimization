import React, { useState, useEffect } from 'react';
import { DFA, ValidationResult } from '../types/dfa';
import { Play, CircleDot, Plus } from 'lucide-react';
import { Plate, Key, Led, StateChip } from './ui';
import { tick } from '../utils/sound';

interface DFAFormProps {
  dfa: DFA;
  validation: ValidationResult;
  onChange: (updatedDFA: DFA) => void;
}

export const DFAForm: React.FC<DFAFormProps> = ({ dfa, validation, onChange }) => {
  const [statesInput, setStatesInput] = useState(dfa.states.join(', '));
  const [alphabetInput, setAlphabetInput] = useState(dfa.alphabet.join(', '));

  // Sync internal text inputs when parent dfa changes (e.g. on preset load)
  useEffect(() => {
    setStatesInput(dfa.states.join(', '));
    setAlphabetInput(dfa.alphabet.join(', '));
  }, [dfa]);

  const handleStatesChange = (val: string) => {
    setStatesInput(val);
    const parsedStates = val
      .split(/[, space\s]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const newStates = Array.from(new Set(parsedStates));

    let newStart = dfa.startState;
    if (newStates.length > 0 && !newStates.includes(newStart)) {
      newStart = newStates[0];
    }

    const newFinals = dfa.finalStates.filter(s => newStates.includes(s));

    const newTransitions: Record<string, Record<string, string>> = {};
    newStates.forEach(st => {
      newTransitions[st] = {};
      dfa.alphabet.forEach(sym => {
        const existing = dfa.transitions[st]?.[sym];
        newTransitions[st][sym] = newStates.includes(existing) ? existing : (newStates[0] || '');
      });
    });

    onChange({
      ...dfa,
      states: newStates,
      startState: newStart,
      finalStates: newFinals,
      transitions: newTransitions,
    });
  };

  const addState = () => {
    let newState: string | undefined;

    if (dfa.states.every(state => /^[A-Z]$/.test(state))) {
      newState = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').find(state => !dfa.states.includes(state));
    } else {
      const numberedStates = dfa.states.map(state => state.match(/^(.*?)(\d+)$/));
      const prefix = numberedStates[0]?.[1];
      if (prefix !== undefined && numberedStates.every(match => match && match[1] === prefix)) {
        const nextNumber = Math.max(...numberedStates.map(match => Number(match?.[2] ?? -1))) + 1;
        newState = `${prefix}${nextNumber}`;
      }
    }

    if (!newState) {
      let suffix = 1;
      newState = `State${suffix}`;
      while (dfa.states.includes(newState)) {
        suffix += 1;
        newState = `State${suffix}`;
      }
    }

    handleStatesChange([...dfa.states, newState].join(', '));
  };

  const handleAlphabetChange = (val: string) => {
    setAlphabetInput(val);
    const parsedSyms = val
      .split(/[, space\s]+/)
      .map(s => s.trim())
      .filter(Boolean);

    const newAlphabet = Array.from(new Set(parsedSyms));

    const newTransitions: Record<string, Record<string, string>> = {};
    dfa.states.forEach(st => {
      newTransitions[st] = {};
      newAlphabet.forEach(sym => {
        const existing = dfa.transitions[st]?.[sym];
        newTransitions[st][sym] = dfa.states.includes(existing) ? existing : (dfa.states[0] || '');
      });
    });

    onChange({
      ...dfa,
      alphabet: newAlphabet,
      transitions: newTransitions,
    });
  };

  const handleTransitionChange = (fromState: string, symbol: string, toState: string) => {
    onChange({
      ...dfa,
      transitions: {
        ...dfa.transitions,
        [fromState]: {
          ...(dfa.transitions[fromState] || {}),
          [symbol]: toState,
        },
      },
    });
  };

  const toggleFinalState = (state: string) => {
    const isFinal = dfa.finalStates.includes(state);
    onChange({
      ...dfa,
      finalStates: isFinal ? dfa.finalStates.filter(s => s !== state) : [...dfa.finalStates, state],
    });
  };

  const hasWarnings = validation.warnings.length > 0;

  return (
    <Plate index="01" title="Define" subtitle="Type the states and alphabet, then wire up δ. Tap ▶ to pick the start state and ◉ to mark accepting states.">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2 h-8">
            <label htmlFor="dfa-states" className="caps">States <span className="normal-case tracking-normal text-[13px]">Q</span></label>
            <Key size="xs" onClick={addState}>
              <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
              Add
            </Key>
          </div>
          <input
            id="dfa-states"
            type="text"
            value={statesInput}
            onChange={(e) => handleStatesChange(e.target.value)}
            placeholder="A, B, C"
            spellCheck={false}
            className="field h-12 w-full text-[15px]"
          />
          <p className="mt-2 caps">{dfa.states.length} states</p>
        </div>

        <div>
          <div className="flex items-center mb-2 h-8">
            <label htmlFor="dfa-alphabet" className="caps">Alphabet <span className="normal-case tracking-normal text-[13px]">Σ</span></label>
          </div>
          <input
            id="dfa-alphabet"
            type="text"
            value={alphabetInput}
            onChange={(e) => handleAlphabetChange(e.target.value)}
            placeholder="0, 1"
            spellCheck={false}
            className="field h-12 w-full text-[15px]"
          />
          <p className="mt-2 caps">{dfa.alphabet.length} symbols</p>
        </div>
      </div>

      {/* Validation strip */}
      <div className="well rounded-[22px] mt-5 px-4 py-3.5 space-y-2" role="status" aria-live="polite">
        {validation.isValid ? (
          <div className="flex items-center gap-3 text-sm font-semibold">
            <Led tone={hasWarnings ? 'warn' : 'ok'} />
            <span>{hasWarnings ? 'Valid, with a note' : 'Valid. Results update as you edit.'}</span>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 text-sm font-semibold text-bad">
              <Led tone="bad" />
              <span>{validation.errors.length} {validation.errors.length === 1 ? 'problem' : 'problems'} to fix</span>
            </div>
            <ul className="pl-[22px] space-y-1 text-[13px] text-ink/80">
              {validation.errors.map((err, idx) => <li key={idx}>{err}</li>)}
            </ul>
          </>
        )}
        {hasWarnings && (
          <ul className="pl-[22px] space-y-1 text-[13px] text-warn/90">
            {validation.warnings.map((warn, idx) => <li key={idx}>{warn}</li>)}
          </ul>
        )}
      </div>

      {/* Transition table */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="caps">Transitions <span className="normal-case tracking-normal text-[13px]">δ</span></span>
          <span className="caps">{dfa.states.length} × {dfa.alphabet.length}</span>
        </div>

        <div className="well overflow-x-auto p-2">
          <table className="w-full text-sm border-separate border-spacing-y-1.5 border-spacing-x-0">
            <thead>
              <tr className="text-left">
                <th className="caps font-semibold px-2 pb-1">State</th>
                <th className="caps font-semibold px-1 pb-1 text-center">Start</th>
                <th className="caps font-semibold px-1 pb-1 text-center">Accept</th>
                {dfa.alphabet.map(sym => (
                  <th key={sym} className="px-1.5 pb-1 text-center font-mono text-xs text-muted font-semibold normal-case">
                    on <span className="text-ink">{sym}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dfa.states.map(state => {
                const isStart = state === dfa.startState;
                const isFinal = dfa.finalStates.includes(state);
                return (
                  <tr key={state}>
                    <td className="px-2">
                      <StateChip name={state} />
                    </td>
                    <td className="px-1 text-center">
                      <button
                        type="button"
                        className="toggle"
                        data-on={isStart || undefined}
                        aria-pressed={isStart}
                        aria-label={`Make ${state} the start state`}
                        title="Start state"
                        onClick={() => {
                          if (isStart) return;
                          tick('low');
                          onChange({ ...dfa, startState: state });
                        }}
                      >
                        <Play className="w-3.5 h-3.5" fill="currentColor" />
                      </button>
                    </td>
                    <td className="px-1 text-center">
                      <button
                        type="button"
                        className="toggle"
                        data-on={isFinal || undefined}
                        aria-pressed={isFinal}
                        aria-label={`Toggle ${state} as accepting`}
                        title="Accepting state"
                        onClick={() => {
                          tick('low');
                          toggleFinalState(state);
                        }}
                      >
                        <CircleDot className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                    </td>
                    {dfa.alphabet.map(symbol => (
                      <td key={symbol} className="px-1">
                        <select
                          value={dfa.transitions[state]?.[symbol] || ''}
                          onChange={(e) => handleTransitionChange(state, symbol, e.target.value)}
                          aria-label={`δ(${state}, ${symbol})`}
                          className="field field-select h-9 w-full min-w-[72px] text-[13px] font-bold rounded-xl pl-3"
                        >
                          {dfa.states.map(target => (
                            <option key={target} value={target}>{target}</option>
                          ))}
                        </select>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Plate>
  );
};
