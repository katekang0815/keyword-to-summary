import { useEffect, useState } from "react";

interface TranscriptItem {
  text: string;
  start: number;
  duration: number;
}

interface TranscriptResponse {
  transcript: TranscriptItem[];
  available: boolean;
  error?: string;
}

export default function VideoTranscript({ videoId }: { videoId: string }) {
  const [lines, setLines] = useState<TranscriptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("https://<your-edge-fn-url>/getTranscript", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ videoId }),
    })
      .then((res) => res.json() as Promise<TranscriptResponse>)
      .then((data) => {
        if (data.available) {
          setLines(data.transcript);
        } else {
          setError(data.error || "Transcript not available.");
        }
      })
      .catch(() => {
        setError("Transcript not available.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [videoId]);

  if (loading) {
    return <p className="mt-4 text-gray-600">Loading transcript…</p>;
  }
  if (error) {
    return <p className="mt-4 text-gray-600">{error}</p>;
  }

  return (
    <div className="mt-8 bg-white p-4 rounded-lg shadow-sm max-h-64 overflow-y-auto">
      {lines.map((line, i) => (
        <p key={i} className="text-sm leading-relaxed">
          {line.text}
        </p>
      ))}
    </div>
  );
}