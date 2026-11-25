import React, { useState } from 'react';
import { DFA } from '../types/dfa';
import { formatGroupLabel } from '../utils/dfaUtils';
import { Plate, Segmented, groupColor } from './ui';

interface DFAVisualizerProps {
  originalDFA: DFA;
  minimizedDFA: DFA;
  /** Partition at the step currently shown in the stepper */
  partitions: string[][];
  /** Final stable partition */
  finalPartitions: string[][];
  unreachable: string[];
  stepNumber: number;
  stepTotal: number;
}

type ViewMode = 'both' | 'original' | 'minimized';

export const DFAVisualizer: React.FC<DFAVisualizerProps> = ({
  originalDFA,
  minimizedDFA,
  partitions,
  finalPartitions,
  unreachable,
  stepNumber,
  stepTotal,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('both');

  const originalColor = (state: string) => {
    const i = partitions.findIndex(g => g.includes(state));
    return i >= 0 ? groupColor(i) : undefined;
  };
  const minimizedColor = (label: string) => {
    const i = finalPartitions.findIndex(g => formatGroupLabel(g) === label);
    return i >= 0 ? groupColor(i) : undefined;
  };

  return (
    <Plate
      index="02"
      title="Graph"
      subtitle={
        partitions.length > 0
          ? `Original states are colored by their class at step ${stepNumber} of ${stepTotal}. Minimized states use the final classes.`
          : `Step ${stepNumber} of ${stepTotal} has no classes yet. Faded states can't be reached from the start.`
      }
      actions={
        <Segmented<ViewMode>
          label="Graph view"
          value={viewMode}
          onChange={setViewMode}
          options={[
            { value: 'both', label: 'Both' },
            { value: 'original', label: 'Original' },
            { value: 'minimized', label: 'Minimized' },
          ]}
        />
      }
    >
      <div className={`grid gap-4 ${viewMode === 'both' ? 'lg:grid-cols-2' : ''}`}>
        {viewMode !== 'minimized' && (
          <GraphCard
            dfa={originalDFA}
            title="Original"
            idPrefix="orig"
            colorOf={originalColor}
            unreachable={unreachable}
          />
        )}
        {viewMode !== 'original' && (
          <GraphCard
            dfa={minimizedDFA}
            title="Minimized"
            idPrefix="min"
            colorOf={minimizedColor}
            unreachable={[]}
            highlight
          />
        )}
      </div>
    </Plate>
  );
};

interface GraphCardProps {
  dfa: DFA;
  title: string;
  idPrefix: string;
  colorOf: (state: string) => string | undefined;
  unreachable: string[];
  highlight?: boolean;
}

const W = 460;
const H = 404;
const R = 24;
const MONO = '"JetBrains Mono", ui-monospace, monospace';

const GraphCard: React.FC<GraphCardProps> = ({ dfa, title, idPrefix, colorOf, unreachable, highlight }) => {
  const cx = W / 2;
  const cy = H / 2;
  const ring = Math.min(W, H) * 0.3;

  // Nodes grow to fit long merged labels like "{q1, q2, q5}"
  const fontFor = (state: string) => (state.length > 3 ? 10 : 13);
  const radius = (state: string) => Math.max(R, (state.length * fontFor(state) * 0.6) / 2 + 7);

  const nodes: Record<string, { x: number; y: number }> = {};
  dfa.states.forEach((state, i) => {
    if (dfa.states.length === 1) {
      nodes[state] = { x: cx, y: cy };
    } else {
      const angle = (2 * Math.PI * i) / dfa.states.length - Math.PI / 2;
      nodes[state] = { x: cx + ring * Math.cos(angle), y: cy + ring * Math.sin(angle) };
    }
  });

  // Group symbols per (from, to) so parallel transitions share one edge
  const edges = new Map<string, string[]>();
  dfa.states.forEach(from => {
    dfa.alphabet.forEach(sym => {
      const to = dfa.transitions[from]?.[sym];
      if (to && nodes[from] && nodes[to]) {
        const key = `${from}\u0000${to}`;
        if (!edges.has(key)) edges.set(key, []);
        edges.get(key)!.push(sym);
      }
    });
  });

  const arrow = `${idPrefix}-arrow`;
  const arrowStart = `${idPrefix}-arrow-start`;
  const shine = `${idPrefix}-shine`;

  const edgeStroke = 'rgb(var(--muted) / 0.75)';

  const label = (x: number, y: number, text: string, faded: boolean) => {
    const w = Math.max(22, text.length * 7 + 12);
    return (
      <g opacity={faded ? 0.3 : 1}>
        <rect x={x - w / 2} y={y - 9} width={w} height={18} rx={6} style={{ fill: 'rgb(var(--plate))', stroke: 'rgb(var(--line))' }} />
        <text x={x} y={y + 4} textAnchor="middle" fontSize={11} fontWeight={700} fontFamily={MONO} style={{ fill: 'rgb(var(--ink))' }}>
          {text}
        </text>
      </g>
    );
  };

  return (
    <div className="well p-3 sm:p-4 rounded-3xl">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold">{title}</h3>
        <span
          className={`font-mono text-xs font-bold px-2 h-6 inline-flex items-center rounded-lg ${
            highlight ? 'bg-accent/15 text-accent ring-1 ring-inset ring-accent/40' : 'bg-plate-hi text-muted ring-1 ring-inset ring-line'
          }`}
        >
          |Q| = {dfa.states.length}
        </span>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label={`${title} DFA graph`}>
        <defs>
          <marker id={arrow} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" style={{ fill: 'rgb(var(--muted))' }} />
          </marker>
          <marker id={arrowStart} viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1 L 10 5 L 0 9 z" style={{ fill: 'rgb(var(--accent))' }} />
          </marker>
          <radialGradient id={shine} cx="35%" cy="28%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
            <stop offset="38%" stopColor="#fff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.32" />
          </radialGradient>
        </defs>

        {/* Edges */}
        {Array.from(edges.entries()).map(([key, symbols]) => {
          const [from, to] = key.split('\u0000');
          const p1 = nodes[from];
          const p2 = nodes[to];
          const text = symbols.join(', ');
          const faded = unreachable.includes(from);

          if (from === to) {
            // Point the loop away from the ring's center so it doesn't cross other edges
            const rr = radius(from);
            const a = dfa.states.length === 1 ? -Math.PI / 2 : Math.atan2(p1.y - cy, p1.x - cx);
            const at = (ang: number, d: number) => [p1.x + d * Math.cos(ang), p1.y + d * Math.sin(ang)];
            const [s1x, s1y] = at(a - 0.45, rr);
            const [e1x, e1y] = at(a + 0.45, rr + 2);
            const [c1x, c1y] = at(a - 0.8, rr + 46);
            const [c2x, c2y] = at(a + 0.8, rr + 46);
            const [lx, ly] = at(a, rr + 36);
            return (
              <g key={key}>
                <path
                  d={`M ${s1x} ${s1y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${e1x} ${e1y}`}
                  fill="none"
                  strokeWidth={1.75}
                  style={{ stroke: edgeStroke }}
                  opacity={faded ? 0.3 : 1}
                  markerEnd={`url(#${arrow})`}
                />
                {label(lx, ly, text, faded)}
              </g>
            );
          }

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.hypot(dx, dy);
          if (dist === 0) return null;
          const ux = dx / dist;
          const uy = dy / dist;
          const sx = p1.x + ux * radius(from);
          const sy = p1.y + uy * radius(from);
          const ex = p2.x - ux * (radius(to) + 2);
          const ey = p2.y - uy * (radius(to) + 2);

          if (edges.has(`${to}\u0000${from}`)) {
            const qx = (p1.x + p2.x) / 2 - uy * 28;
            const qy = (p1.y + p2.y) / 2 + ux * 28;
            // Label sits on the curve's midpoint
            const lx = 0.25 * sx + 0.5 * qx + 0.25 * ex;
            const ly = 0.25 * sy + 0.5 * qy + 0.25 * ey;
            return (
              <g key={key}>
                <path
                  d={`M ${sx} ${sy} Q ${qx} ${qy} ${ex} ${ey}`}
                  fill="none"
                  strokeWidth={1.75}
                  style={{ stroke: edgeStroke }}
                  opacity={faded ? 0.3 : 1}
                  markerEnd={`url(#${arrow})`}
                />
                {label(lx, ly, text, faded)}
              </g>
            );
          }

          return (
            <g key={key}>
              <line
                x1={sx}
                y1={sy}
                x2={ex}
                y2={ey}
                strokeWidth={1.75}
                style={{ stroke: edgeStroke }}
                opacity={faded ? 0.3 : 1}
                markerEnd={`url(#${arrow})`}
              />
              {label((sx + ex) / 2, (sy + ey) / 2, text, faded)}
            </g>
          );
        })}

        {/* Nodes */}
        {dfa.states.map(state => {
          const { x, y } = nodes[state];
          const isStart = state === dfa.startState;
          const isFinal = dfa.finalStates.includes(state);
          const faded = unreachable.includes(state);
          const color = faded ? undefined : colorOf(state);
          const fontSize = fontFor(state);
          const r = radius(state);

          return (
            <g key={state} opacity={faded ? 0.35 : 1}>
              {isStart && (
                <g>
                  <line
                    x1={x - r - 34}
                    y1={y}
                    x2={x - r - 5}
                    y2={y}
                    strokeWidth={2.5}
                    style={{ stroke: 'rgb(var(--accent))' }}
                    markerEnd={`url(#${arrowStart})`}
                  />
                  <text
                    x={x - r - 38}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={10}
                    fontWeight={700}
                    fontFamily={MONO}
                    style={{ fill: 'rgb(var(--accent))' }}
                  >
                    start
                  </text>
                </g>
              )}

              {/* soft contact shadow */}
              <ellipse cx={x} cy={y + r + 5} rx={r * 0.8} ry={4} fill="#000" opacity={0.4} />

              {isFinal && (
                <circle
                  cx={x}
                  cy={y}
                  r={r + 5}
                  fill="none"
                  strokeWidth={2}
                  strokeDasharray={faded ? '4 3' : undefined}
                  style={{ stroke: color ? `rgb(${color})` : 'rgb(var(--ink) / 0.7)' }}
                />
              )}

              <circle
                cx={x}
                cy={y}
                r={r}
                strokeWidth={faded ? 1.5 : 1}
                strokeDasharray={faded ? '4 3' : undefined}
                style={{
                  fill: color ? `rgb(${color})` : 'rgb(var(--plate-hi))',
                  stroke: faded ? 'rgb(var(--muted))' : 'rgb(0 0 0 / 0.45)',
                  transition: 'fill 0.35s ease',
                }}
              />
              <circle cx={x} cy={y} r={r} fill={`url(#${shine})`} pointerEvents="none" />

              <text
                x={x}
                y={y + fontSize * 0.36}
                textAnchor="middle"
                fontSize={fontSize}
                fontWeight={800}
                fontFamily={MONO}
                style={{ fill: color ? '#0c0b0a' : 'rgb(var(--ink))' }}
              >
                {state}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
