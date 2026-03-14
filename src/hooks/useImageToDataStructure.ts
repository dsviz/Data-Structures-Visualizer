import { useCallback, useState } from "react";

export type ImageToDSData = any;

type UseImageToDSReturn<T = any> = {
  isProcessing: boolean;
  error: string | null;
  result: T | null;
  reset: () => void;
  uploadImageFile: (file: File | null) => Promise<void>;
};

export type DSType = 'Graph' | 'Array' | 'Tree' | 'LinkedList' | 'Stack/Queue';

/**
 * Hook that converts an uploaded image file into a data structure by calling Gemini.
 */
export function useImageToDataStructure<T = ImageToDSData>(userApiKey: string | null | undefined, dsType: DSType): UseImageToDSReturn<T> {
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
        const commaIndex = dataUrl.indexOf(",");
        if (commaIndex === -1) {
          return reject(new Error("Invalid file data URL"));
        }
        resolve(dataUrl.slice(commaIndex + 1));
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

  const callGeminiVision = useCallback(
    async (base64Image: string) => {
      if (!userApiKey) {
        throw new Error("Missing Gemini API key from settings.");
      }

      const model = "gemini-2.5-flash";
      const prompt = getPromptForDS(dsType);

      const body = {
        model,
        input: {
          text: prompt,
          image: [
            {
              type: "image",
              image: base64Image,
            },
          ],
        },
        temperature: 0.0,
        maxOutputTokens: 2048,
      } as const;

      const response = await fetch(
        `https://api.generative.ai/v1beta2/models/${encodeURIComponent(model)}:generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userApiKey}`,
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `Gemini request failed (${response.status}): ${text || response.statusText}`
        );
      }

      const json = (await response.json()) as any;
      const candidateText =
        json.output?.candidates?.[0]?.content?.[0]?.text ||
        json.output?.candidates?.[0]?.text ||
        json.output?.text ||
        json.output?.results?.[0]?.output?.text ||
        json.output?.results?.[0]?.content?.[0]?.text;

      if (typeof candidateText !== "string") {
        throw new Error("Could not find text output in Gemini response.");
      }

      return candidateText;
    },
    [userApiKey, dsType]
  );

  const uploadImageFile = useCallback(
    async (file: File | null) => {
      reset();
      if (!file) return;

      setIsProcessing(true);
      try {
        const base64 = await readFileAsBase64(file);
        const rawText = await callGeminiVision(base64);

        const trimmed = rawText.trim();
        const cleaned = trimmed
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```$/, "");

        const parsed = JSON.parse(cleaned) as T;
        setResult(parsed);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
        setResult(null);
      } finally {
        setIsProcessing(false);
      }
    },
    [callGeminiVision, readFileAsBase64, reset]
  );

  return { isProcessing, error, result, reset, uploadImageFile };
}
