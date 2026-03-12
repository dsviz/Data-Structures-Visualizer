import { create } from 'zustand';

interface AiContextState {
    dataStructure: string;
    currentFrame: any;
    setDataStructure: (ds: string) => void;
    setCurrentFrame: (frame: any) => void;
    activeIntent: { action: string; value: number | null } | null;
    setIntent: (intent: { action: string; value: number | null }) => void;
    clearIntent: () => void;
}

// We store currentFrame but components only subscribe to what they need
export const useAiContextStore = create<AiContextState>((set) => ({
    dataStructure: '',
    currentFrame: null,
    setDataStructure: (dataStructure) => set((state) => 
        state.dataStructure === dataStructure ? state : { dataStructure }
    ),
    setCurrentFrame: (currentFrame) => set((state) =>
        state.currentFrame === currentFrame ? state : { currentFrame }
    ),
    activeIntent: null,
    setIntent: (activeIntent) => set({ activeIntent }),
    clearIntent: () => set({ activeIntent: null })
}));
