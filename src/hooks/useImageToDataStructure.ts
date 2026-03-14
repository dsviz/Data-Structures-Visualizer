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
        return `You are an expert array extraction tool. Analyze this image and extract the sequence of numbers shown. Return ONLY a valid JSON object matching this exact schema, with no markdown formatting: { "array": [10, 20, 30, 40] }`;
      case 'LinkedList':
        return `You are an expert linked list extraction tool. Analyze this image and extract the nodes sequentially. Return ONLY a valid JSON object matching this schema, with no markdown: { "nodes": [ { "id": 1, "value": 10 }, { "id": 2, "value": 20 } ] }`;
      case 'Tree':
        return `You are an expert tree extraction tool. Analyze this image of a tree. Extract nodes (with their IDs and numeric values) and edges (from parent to child). Return ONLY a valid JSON object matching this schema, with no markdown: { "nodes": [ { "id": 0, "value": 50 }, { "id": 1, "value": 30 } ], "edges": [ { "from": 0, "to": 1 } ] }`;
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
