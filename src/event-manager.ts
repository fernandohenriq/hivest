import 'reflect-metadata';
import { injectable } from 'tsyringe';

import { EventEmitterMetadata, EventHandler, EventListenerMetadata } from './lib/types';

@injectable()
export class EventManager {
  private listeners: Map<string, EventHandler[]> = new Map();
  private emitters: Map<string, EventEmitterMetadata[]> = new Map();

  /**
   * Register event listeners from a class using metadata
   */
  registerListeners(target: any): void {
    const listeners = Reflect.getMetadata('event:listeners', target.constructor) || [];

    listeners.forEach((listener: EventListenerMetadata) => {
      this.on(listener.eventName, listener.handler.bind(target));
    });
  }

  /**
   * Register event emitters from a class using metadata
   */
  registerEmitters(target: any): void {
    const emitters = Reflect.getMetadata('event:emitters', target.constructor) || [];

    emitters.forEach((emitter: EventEmitterMetadata) => {
      if (!this.emitters.has(emitter.eventName)) {
        this.emitters.set(emitter.eventName, []);
      }
      this.emitters.get(emitter.eventName)!.push(emitter);
    });
  }

  /**
   * Register a listener for a specific event
   */
  on<T = any>(eventName: string, handler: EventHandler<T>): void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName)!.push(handler);
  }

  /**
   * Remove a specific listener for an event
   */
  off(eventName: string, handler: EventHandler): void {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Remove all listeners for an event
   */
  offAll(eventName: string): void {
    this.listeners.delete(eventName);
  }

  /**
   * Emit an event to all registered listeners
   */
  async emit<T = any>(eventName: string, data?: T): Promise<void> {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      const promises = handlers.map((handler) => {
        try {
          return Promise.resolve(handler(data));
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
          return Promise.resolve();
        }
      });
      await Promise.all(promises);
    }
  }

  /**
   * Get all registered listeners for an event
   */
  getListeners(eventName: string): EventHandler[] {
    return this.listeners.get(eventName) || [];
  }

  /**
   * Get all registered emitters for an event
   */
  getEmitters(eventName: string): EventEmitterMetadata[] {
    return this.emitters.get(eventName) || [];
  }

  /**
   * Get all registered event names
   */
  getEventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * Clear all listeners and emitters
   */
  clear(): void {
    this.listeners.clear();
    this.emitters.clear();
  }
}
