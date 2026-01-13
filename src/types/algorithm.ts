import { Step } from './step';

export interface Algorithm {
  name: string;
  description: string;
  timeComplexity: {
    best: string;
    average: string;
    worst: string;
  };
  spaceComplexity: string;
  category: 'sorting' | 'searching' | 'tree' | 'graph';
}

export type AlgorithmFunction = (arr: number[]) => Step[];
