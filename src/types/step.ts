/**
 * Step types for algorithm visualization
 * Each algorithm generates steps that the animation engine executes
 */

export type StepType = 
  | 'compare'
  | 'swap'
  | 'set'
  | 'highlight'
  | 'unhighlight'
  | 'insert'
  | 'delete'
  | 'traverse'
  | 'mark-sorted';

export interface Step {
  type: StepType;
  indices?: number[];
  values?: number[];
  message?: string;
  duration?: number;
}

export interface AnimationStep extends Step {
  id: string;
  timestamp: number;
}
