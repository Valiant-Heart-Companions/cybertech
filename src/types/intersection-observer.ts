export type IntersectionObserverCallback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void;

export interface IntersectionObserverInit {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export interface IntersectionObserverEntry {
  boundingClientRect: DOMRectReadOnly;
  intersectionRatio: number;
  intersectionRect: DOMRectReadOnly;
  isIntersecting: boolean;
  rootBounds: DOMRectReadOnly | null;
  target: Element;
  time: number;
} 