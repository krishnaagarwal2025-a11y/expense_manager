
'use client';

type ErrorListener = (error: any) => void;

class ErrorEmitter {
  private listeners: Map<string, Set<ErrorListener>> = new Map();

  on(event: string, listener: ErrorListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(listener);
    return () => this.off(event, listener);
  }

  off(event: string, listener: ErrorListener) {
    this.listeners.get(event)?.delete(listener);
  }

  emit(event: string, error: any) {
    this.listeners.get(event)?.forEach((listener) => listener(error));
  }
}

export const errorEmitter = new ErrorEmitter();
