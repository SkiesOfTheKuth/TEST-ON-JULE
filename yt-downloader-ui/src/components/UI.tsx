import React, { ChangeEvent, ReactNode } from 'react';

type ClassValue = string | boolean | undefined | null;
/**
 * A tiny utility for constructing className strings conditionally.
 * @param classes A list of strings, booleans, or other falsy values.
 * @returns A string of space-separated class names.
 */
export function cx(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}

type IconProps = React.SVGProps<SVGSVGElement>;
/**
 * A collection of simple, inline SVG icons.
 */
export const Icon = {
  Paste: (p: IconProps) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M19 7h-4V5a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2m-6 0h-2V5h2z"/></svg>,
  Moon: (p: IconProps) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M12 2a9 9 0 0 0 0 18 8.8 8.8 0 0 0 6.32-2.68A7 7 0 0 1 12 4a7 7 0 0 1 0-2"/></svg>,
  Sun: (p: IconProps) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.79L6.76 4.84M1 13h3v-2H1v2m10 10h2v-3h-2v3m9.83-2.37l-1.79-1.79-1.79 1.79 1.79 1.79 1.79-1.79M20 13h3v-2h-3v2M6.76 19.16L4.97 21l1.79 1.79 1.79-1.79-1.79-1.84M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8m0-7h2v3h-2V1z"/></svg>,
  Settings: (p: IconProps) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8m8.94 2.66-1.73-.29a6.94 6.94 0 0 0-.7-1.69l1.06-1.4-1.42-1.42-1.4 1.06c-.53-.3-1.1-.54-1.69-.7L14.66 3h-2.32l-.39 1.73c-.59.16-1.16.4-1.69.7L8.86 4.37 7.44 5.79l1.06 1.4c-.3.53-.54 1.1-.7 1.69L6.07 9.66v2.32l1.73.39c.16.59.4 1.16.7 1.69l-1.06 1.4 1.42 1.42 1.4-1.06c.53.3 1.1.54 1.69.7l.39 1.73h2.32l.39-1.73c.59-.16 1.16-.4 1.69-.7l1.4 1.06 1.42-1.42-1.06-1.4c.3-.53.54-1.1.7-1.69l1.73-.39z"/></svg>,
  Download: (p: IconProps) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M5 20h14v-2H5m7-16-5 5h3v6h4v-6h3z"/></svg>,
  Plus: (p: IconProps) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M19 13H13v6h-2v-6H5v-2h6V5h2v6h6z"/></svg>,
  Trash: (p: IconProps) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M9 3v1H4v2h16V4h-5V3H9M6 21a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"/></svg>,
  Play: (p: IconProps) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M8 5v14l11-7z"/></svg>,
  Stop: (p: IconProps) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M6 6h12v12H6z"/></svg>,
  ChevronDown: (p: IconProps) => <svg viewBox="0 0 24 24" aria-hidden className="size-5" {...p}><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>,
};

interface BadgeProps {
  children: ReactNode;
  color?: 'blue' | 'amber' | 'violet';
}
/**
 * A simple, colored badge component for displaying status or metadata.
 */
export const Badge: React.FC<BadgeProps> = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    amber: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
    violet: "bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300",
  };
  return <span className={cx("rounded-full px-2 py-0.5 text-xs", color && colors[color])}>{children}</span>;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  small?: boolean;
}
/**
 * A styled select dropdown component.
 */
export const Select: React.FC<SelectProps> = ({ label, value, onChange, options, small = false }) => {
  return (
    <div className={small ? "" : "flex-1"}>
      {label && <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>}
      <div className="relative">
        <select value={value} onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)} className={cx("w-full appearance-none rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-transparent pl-3 pr-8 py-2 focus:ring-2 focus:ring-blue-500/40", small ? "text-sm" : "")}>
          {options.map((opt) => <option key={opt.value} value={opt.value} className="dark:bg-slate-800">{opt.label}</option>)}
        </select>
        <Icon.ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
      </div>
    </div>
  );
}

interface TextFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}
/**
 * A styled text input field component.
 */
export const TextField: React.FC<TextFieldProps> = ({ label, placeholder, value, onChange }) => {
  return (
    <div className="flex-1">
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      <input value={value} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-300/70 dark:border-slate-700/70 bg-transparent px-3 py-2 focus:ring-2 focus:ring-blue-500/40"/>
    </div>
  );
}

interface KbdProps {
  children: ReactNode;
}
/**
 * A component for rendering keyboard-style keys.
 */
export const Kbd: React.FC<KbdProps> = ({ children }) => <kbd className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 rounded-md dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700">{children}</kbd>;