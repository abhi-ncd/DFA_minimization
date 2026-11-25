import React from 'react';
import { tick } from '../utils/sound';

/** RGB channel triple for partition class `i`, usable as `rgb(${groupColor(i)} / a)`. */
export const groupColor = (i: number) => `var(--g${((i % 8) + 8) % 8})`;

const keySizes = {
  none: '',
  xs: 'h-8 px-2.5 text-xs rounded-[10px]',
  sm: 'h-9 px-3 text-sm rounded-xl',
  md: 'h-11 px-4 text-sm rounded-2xl',
  lg: 'h-14 px-6 text-base rounded-2xl',
  icon: 'h-11 w-11 rounded-2xl',
};

interface KeyProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: 'plain' | 'accent';
  size?: keyof typeof keySizes;
  on?: boolean;
}

export function Key({
  tone = 'plain',
  size = 'md',
  on = false,
  className = '',
  onClick,
  children,
  type = 'button',
  ...rest
}: KeyProps) {
  return (
    <button
      type={type}
      {...rest}
      data-on={on || undefined}
      onClick={(e) => {
        tick(tone === 'accent' ? 'high' : 'low');
        onClick?.(e);
      }}
      className={[
        'key',
        tone === 'accent' ? 'key-accent' : '',
        keySizes[size],
        'inline-flex items-center justify-center gap-2 font-semibold whitespace-nowrap select-none',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

interface PlateProps {
  index?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  id?: string;
}

export function Plate({ index, title, subtitle, actions, children, className = '', id }: PlateProps) {
  return (
    <section id={id} className={`plate p-5 sm:p-7 scroll-mt-24 ${className}`}>
      {title && (
        <header className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="min-w-0">
            {index && <div className="font-mono text-xs font-bold text-accent mb-2">{index}</div>}
            <h2 className="text-[28px] sm:text-[34px] font-extrabold tracking-[-0.02em] leading-none">{title}</h2>
            {subtitle && <p className="mt-2.5 text-sm text-muted max-w-xl leading-relaxed">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

interface SegmentedProps<T extends string> {
  value: T;
  options: { value: T; label: React.ReactNode }[];
  onChange: (value: T) => void;
  label?: string;
}

export function Segmented<T extends string>({ value, options, onChange, label }: SegmentedProps<T>) {
  return (
    <div className="well inline-flex p-1 gap-1 rounded-2xl" role="radiogroup" aria-label={label}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => {
              if (on) return;
              tick('low');
              onChange(o.value);
            }}
            className={`h-8 px-3.5 rounded-xl text-sm font-semibold transition-colors ${
              on ? 'seg-on text-ink' : 'text-muted hover:text-ink'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Led({ tone }: { tone: 'ok' | 'bad' | 'warn' | 'accent' | 'muted' }) {
  return (
    <span
      aria-hidden
      className="led inline-block shrink-0"
      style={{ ['--led' as string]: `var(--${tone})` } as React.CSSProperties}
    />
  );
}

interface StateChipProps {
  name: string;
  /** RGB channel triple, e.g. from groupColor() */
  color?: string;
  strike?: boolean;
  className?: string;
}

export function StateChip({ name, color, strike, className = '' }: StateChipProps) {
  const style: React.CSSProperties = color
    ? {
        background: `rgb(${color} / 0.15)`,
        color: `rgb(${color})`,
        boxShadow: `inset 0 0 0 1px rgb(${color} / 0.4)`,
      }
    : {
        background: 'rgb(var(--plate-hi))',
        color: 'rgb(var(--ink))',
        boxShadow: 'inset 0 0 0 1px rgb(var(--line))',
      };
  return (
    <span
      className={`inline-flex items-center h-7 px-2.5 rounded-lg font-mono text-[13px] font-bold ${
        strike ? 'line-through opacity-50' : ''
      } ${className}`}
      style={style}
    >
      {name}
    </span>
  );
}

export function Verdict({ accepted }: { accepted: boolean }) {
  return (
    <span
      className={`inline-flex items-center h-7 px-2.5 rounded-lg font-mono text-[11px] font-bold tracking-wider ${
        accepted ? 'bg-ok/15 text-ok ring-1 ring-inset ring-ok/40' : 'bg-bad/15 text-bad ring-1 ring-inset ring-bad/40'
      }`}
    >
      {accepted ? 'ACCEPT' : 'REJECT'}
    </span>
  );
}
