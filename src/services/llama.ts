export interface IntelligenceResult {
  answer: string;
  reasoning: string[];
  sources: string[];
  metadata: {
    confidence: number;
    tokens: number;
    latency: string;
  };
}

export interface FileData {
  data: string;
  mimeType: string;
}

export interface AnalyzeConfig {
  useGrounding?: boolean;
  model?: string;
  temperature?: number;
  history?: { query: string; answer: string }[];
}

export async function analyzeFileData(
  input: string,
  fileData?: FileData,
  config: AnalyzeConfig = {}
): Promise<IntelligenceResult> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: input,
      fileData,
      config,
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(bodyText || `Backend request failed with status ${response.status}`);
  }

  return await response.json();
}
