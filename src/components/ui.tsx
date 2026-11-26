import React from 'react';
import { tick } from '../utils/sound';

/** RGB channel triple for partition class `i`, usable as `rgb(${groupColor(i)} / a)`. */
export const groupColor = (i: number) => `var(--g${((i % 8) + 8) % 8})`;

const keySizes = {
  none: '',
  xs: 'h-8 px-3 text-[11px] font-mono uppercase tracking-[0.08em] rounded-full',
  sm: 'h-9 px-3.5 text-xs font-mono uppercase tracking-[0.08em] rounded-full',
  md: 'h-11 px-5 text-xs font-mono uppercase tracking-[0.1em] rounded-full',
  lg: 'h-14 px-7 text-sm font-mono uppercase tracking-[0.1em] rounded-full',
  icon: 'h-11 w-11 rounded-full',
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
            {index && <div className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.12em] text-accent mb-3">{index}</div>}
            <h2 className="word3d text-[48px] sm:text-[64px]">{title}</h2>
            {subtitle && (
              <p className="mt-4 font-mono text-[12px] uppercase tracking-[0.06em] text-muted max-w-xl leading-relaxed">{subtitle}</p>
            )}
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
    <div className="well inline-flex p-1 gap-1 rounded-full" role="radiogroup" aria-label={label}>
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
            className={`h-9 px-4 rounded-full font-mono text-[11.5px] font-medium uppercase tracking-[0.1em] transition-colors ${
              on ? 'seg-on' : 'text-muted hover:text-ink'
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
  /** RGB channel triple for the text on a coloured chip (dark by default) */
  textColor?: string;
  strike?: boolean;
  className?: string;
}

export function StateChip({ name, color, textColor = '17 17 17', strike, className = '' }: StateChipProps) {
  const style: React.CSSProperties = color
    ? { background: `rgb(${color})`, color: `rgb(${textColor})` }
    : { background: 'rgb(var(--plate))', color: 'rgb(var(--ink))', boxShadow: 'inset 0 0 0 1px rgb(var(--line))' };
  return (
    <span
      className={`inline-flex items-center h-7 px-2.5 rounded-full font-mono text-[13px] font-bold ${
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
      className={`inline-flex items-center h-7 px-3 rounded-full font-mono text-[11px] font-semibold tracking-[0.1em] ${
        accepted ? 'bg-ok' : 'bg-bad'
      }`}
      style={{ color: 'rgb(var(--on-status))' }}
    >
      {accepted ? 'ACCEPT' : 'REJECT'}
    </span>
  );
}
