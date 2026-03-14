import { useCallback, useState } from "react";
import { extractDataFromImage } from "../services/aiService";

export type ImageToDSData = any;

type UseImageToDSReturn<T = any> = {
  isProcessing: boolean;
  error: string | null;
  result: T | null;
  reset: () => void;
  uploadImageFile: (file: File | null) => Promise<void>;
};

export type DSType = 'Graph' | 'Array' | 'Tree' | 'LinkedList' | 'Stack/Queue' | 'Sorting';

/**
 * Hook that converts an uploaded image file into a data structure by calling our backend AI service.
 */
export function useImageToDataStructure<T = ImageToDSData>(dsType: DSType): UseImageToDSReturn<T> {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
    setIsProcessing(false);
  }, []);

  const readFileAsBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        if (!base64) {
          return reject(new Error("Invalid file content."));
        }
        resolve(base64);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }, []);

  const getPromptForDS = (type: DSType) => {
    switch (type) {
      case 'Graph':
        return `You are an expert graph extraction tool. Analyze this image and extract all nodes and their approximate relative X and Y coordinates. Extract all edges connecting them, noting the source, target, and if it is directed. Return ONLY a valid JSON object matching this exact schema, with no markdown formatting: { "nodes": [ { "id": "A", "x": 100, "y": 100 } ], "edges": [ { "source": "A", "target": "B", "directed": true } ] }`;
      case 'Array':
      case 'Sorting':
      case 'Stack/Queue':
        return `You are a computer vision expert analyzing hand-drawn data structure diagrams. Analyze this image and extract the sequence of numbers shown. Return ONLY a valid JSON object matching this exact schema, with no markdown formatting: { "array": [10, 20, 30, 40] }`;
      case 'LinkedList':
        return `You are a computer vision expert analyzing hand-drawn data structure diagrams. This is an image of a Linked List.
Task:
1. Identify the starting node (usually on the left or top).
2. Follow the arrows sequentially from one node to the next.
3. Extract the sequence of numbers strictly in the order they are connected by arrows.
Return ONLY a valid JSON object matching this exact schema, with no markdown formatting: { "array": [10, 20, 30, 40] }`;
      case 'Tree':
        return `You are a computer vision expert analyzing hand-drawn data structure diagrams. This is an image of a Binary Tree.
Task:
1. Identify EVERY single circle/node in the image. Do not miss any. Assign each a unique ID (0, 1, 2...).
2. Read the number inside each node (this is the 'value').
3. Identify all lines (edges) connecting the nodes.
4. For each node, figure out which node is its left child (connected below and to the left) and right child (connected below and to the right). Include their IDs in the 'left' and 'right' properties if they exist.
Return ONLY a valid JSON object matching exactly this schema, with no markdown formatting: { "nodes": [ { "id": 0, "value": 50, "left": 1, "right": 2 }, { "id": 1, "value": 30 } ], "edges": [ { "from": 0, "to": 1 }, { "from": 0, "to": 2 } ] }`;
      default:
        return "You are a data extraction tool. Extract the numeric values shown in the image as a JSON array.";
    }
  };

  const uploadImageFile = useCallback(
    async (file: File | null) => {
      reset();
      if (!file) return;

      setIsProcessing(true);
      setError(null);
      try {
        console.log("Starting image upload via backend...", { dsType, mimeType: file.type });
        const base64 = await readFileAsBase64(file);
        
        const prompt = getPromptForDS(dsType);
        
        const { text: rawText } = await extractDataFromImage(
          prompt,
          base64,
          file.type
        );

        console.log("Response received from backend.");
        const trimmed = rawText.trim();
        const cleaned = trimmed
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "");

        const parsed = JSON.parse(cleaned) as T;
        setResult(parsed);
      } catch (err) {
        console.error("Extraction Error:", err);
        const message = err instanceof Error ? err.message : String(err);
        setError(`Extraction Error: ${message}`);
        setResult(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [dsType, readFileAsBase64, reset]
  );

  return { isProcessing, error, result, reset, uploadImageFile };
}
