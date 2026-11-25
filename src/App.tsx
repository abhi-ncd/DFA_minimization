import React, { useState, useMemo, useEffect } from 'react';
import { DFA, PresetTestCase } from './types/dfa';
import { validateDFA, minimizeDFA, PRESET_DFAS } from './utils/dfaUtils';
import { Header, SKINS, Skin } from './components/Header';
import { Readout } from './components/Readout';
import { DFAForm } from './components/DFAForm';
import { StepByStepView } from './components/StepByStepView';
import { DFAVisualizer } from './components/DFAVisualizer';
import { StringSimulator } from './components/StringSimulator';
import { TestPresets } from './components/TestPresets';
import { Led } from './components/ui';

const loadSkin = (): Skin => {
  try {
    const saved = localStorage.getItem('dfa-skin');
    if (saved && (SKINS as readonly string[]).includes(saved)) return saved as Skin;
  } catch {
    /* storage unavailable */
  }
  return 'ember';
};

export const App: React.FC = () => {
  const defaultPreset = PRESET_DFAS[0];
  const [dfa, setDfa] = useState<DFA>(defaultPreset.dfa);
  const [currentPresetId, setCurrentPresetId] = useState<string>(defaultPreset.id);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [sampleStrings, setSampleStrings] = useState<string[]>(defaultPreset.sampleStrings);
  const [skin, setSkin] = useState<Skin>(loadSkin);

  useEffect(() => {
    document.documentElement.dataset.skin = skin;
    try {
      localStorage.setItem('dfa-skin', skin);
    } catch {
      /* storage unavailable */
    }
  }, [skin]);

  const validation = useMemo(() => validateDFA(dfa), [dfa]);
  const result = useMemo(() => (validation.isValid ? minimizeDFA(dfa) : null), [dfa, validation.isValid]);

  const steps = result?.steps ?? [];
  const stepIndex = Math.min(currentStepIndex, Math.max(steps.length - 1, 0));
  const currentStep = steps[stepIndex];
  const finalPartitions = steps.length > 0 ? steps[steps.length - 1].partitions : [];
  const preset = PRESET_DFAS.find(p => p.id === currentPresetId);

  const selectPreset = (p: PresetTestCase) => {
    setDfa(p.dfa);
    setCurrentPresetId(p.id);
    setCurrentStepIndex(0);
    setSampleStrings(p.sampleStrings);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header skin={skin} onSkinChange={setSkin} onReset={() => selectPreset(PRESET_DFAS[0])} />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <Readout
            result={result}
            title={preset?.name ?? 'Custom DFA'}
            description={preset?.description ?? 'Edited by hand. Everything below updates as you change it.'}
          />
          <TestPresets currentPresetId={currentPresetId} onSelectPreset={selectPreset} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start">
          <DFAForm
            dfa={dfa}
            validation={validation}
            onChange={(updated) => {
              setDfa(updated);
              setCurrentPresetId('custom');
              setCurrentStepIndex(0);
            }}
          />
          {result && currentStep ? (
            <DFAVisualizer
              originalDFA={result.originalDFA}
              minimizedDFA={result.minimizedDFA}
              partitions={currentStep.partitions}
              finalPartitions={finalPartitions}
              unreachable={result.unreachableStates}
              stepNumber={stepIndex + 1}
              stepTotal={steps.length}
            />
          ) : (
            <section className="plate p-8 sm:p-10 flex flex-col items-center justify-center text-center min-h-[320px]">
              <Led tone="bad" />
              <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.01em]">Nothing to draw yet</h2>
              <p className="mt-2 text-sm text-muted max-w-sm">
                Fix the problems listed under Define and the graph, refinement steps and simulator come back.
              </p>
            </section>
          )}
        </div>

        {result && (
          <>
            <StepByStepView
              minimizationResult={result}
              currentStepIndex={stepIndex}
              onStepChange={setCurrentStepIndex}
            />
            <StringSimulator
              key={currentPresetId}
              originalDFA={result.originalDFA}
              minimizedDFA={result.minimizedDFA}
              initialStrings={sampleStrings}
            />
          </>
        )}
      </main>

      <footer className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-10 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span className="font-semibold">DFA Minimizer</span>
        <span>Automata Theory &amp; Formal Languages project</span>
      </footer>
    </div>
  );
};

export default App;
