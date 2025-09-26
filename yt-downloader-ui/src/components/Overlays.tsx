import React from 'react';
import { createPortal } from 'react-dom';
import { Kbd, cx } from './UI';
import type { QATest, Toast } from '../types';

interface OverlayProps {
  open: boolean;
  onClose: () => void;
}

/**
 * A modal overlay that displays keyboard shortcuts and other help information.
 */
export const HelpOverlay: React.FC<OverlayProps> = ({ open, onClose }) => {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}/>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200/70 dark:border-slate-800/70 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Shortcuts & Tips</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&times;</button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-300">Focus URL input</span><div><Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></div></div>
          <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-300">Add to queue</span><div><Kbd>Ctrl</Kbd> + <Kbd>D</Kbd></div></div>
          <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-300">Toggle this help</span><div><Kbd>?</Kbd></div></div>
          <div className="flex items-center justify-between"><span className="text-slate-600 dark:text-slate-300">Toggle QA tests</span><div><Kbd>Alt</Kbd> + <Kbd>T</Kbd></div></div>
        </div>
      </div>
    </div>,
    document.body
  );
}

interface QAPanelProps extends OverlayProps {
  tests: QATest[];
}

/**
 * A panel that displays the results of the internal QA test suite.
 */
export const QAPanel: React.FC<QAPanelProps> = ({ open, onClose, tests }) => {
  if (!open) return null;
  return createPortal(
    <div className="fixed right-3 bottom-3 z-50 w-80 bg-white dark:bg-slate-950 rounded-2xl shadow-xl border border-slate-200/70 dark:border-slate-800/70 p-4 text-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">QA Tests</h3>
        <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">&times;</button>
      </div>
      <ul>
        {tests.map(t => (
          <li key={t.name} className="flex items-center gap-2">
            <span className={t.ok ? "text-emerald-500" : "text-red-500"}>{t.ok ? "✓" : "✗"}</span>
            <span className="text-slate-600 dark:text-slate-300">{t.name}</span>
            {t.msg && <span className="text-slate-500 truncate" title={t.msg}>{t.msg}</span>}
          </li>
        ))}
      </ul>
    </div>,
    document.body
  );
}

interface ToastContainerProps {
  toasts: Toast[];
}

/**
 * A container that displays toast notifications at the bottom of the screen.
 */
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  const colors: Record<Toast['type'], string> = {
    info: "border-blue-500/50",
    success: "border-emerald-500/50",
    error: "border-red-500/50",
  };
  return createPortal(
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2">
      {toasts.map(toast => (
        <div key={toast.id} className={cx(
          "px-4 py-2 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-100 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-lg border",
          colors[toast.type]
        )}>
          {toast.message}
        </div>
      ))}
    </div>,
    document.body
  );
}