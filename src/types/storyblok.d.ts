/* eslint-disable */
// Custom type definitions for Storyblok SDK

import '@storyblok/react';

declare module '@storyblok/react' {
  export interface ISbConfig {
    bridge?: {
      resolveRelations?: string[];
      customParent?: string;
      additionalParams?: Record<string, string>;
    };
  }

  export interface ISbStoriesParams {
    cv?: string | number;
    resolve_relations?: string;
    [key: string]: any;
  }
}
