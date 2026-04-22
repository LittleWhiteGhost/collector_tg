export type TGWebApp = {
  ready?: () => void; expand?: () => void;
  openInvoice?: (url: string, cb: (s: string) => void) => void;
  close?: () => void;
  HapticFeedback?: { impactOccurred?: (s: string) => void };
};
export const tg = (): TGWebApp | undefined =>
  (window as unknown as { Telegram?: { WebApp?: TGWebApp } }).Telegram?.WebApp;
