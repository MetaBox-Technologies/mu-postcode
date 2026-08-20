"use client";

import { useState, useCallback } from "react";

type Result = {
  id: string;
  postcode: string;
  locality: string;
  town: string;
  street: string;
  island: string;
};

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const search = useCallback(async (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(value.trim())}`);
      setResults(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const copy = (postcode: string) => {
    navigator.clipboard.writeText(postcode);
    setCopied(postcode);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "#ededed", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 20px 40px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📮</div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Mauritius Postcode Finder</h1>
          <p style={{ color: "#888", marginTop: 8, fontSize: 14 }}>Search by postcode, locality, town, or street</p>
        </div>

        {/* Search input */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => search(e.target.value)}
            placeholder="e.g. 11101, Curepipe, Camp Firinga…"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "14px 18px",
              fontSize: 16,
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: 10,
              color: "#ededed",
              outline: "none",
            }}
          />
          {loading && (
            <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#666", fontSize: 13 }}>
              …
            </div>
          )}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map((r) => (
              <div
                key={r.id}
                onClick={() => copy(r.postcode)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "#141414",
                  border: "1px solid #222",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "border-color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#444")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#222")}
              >
                <div>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 15 }}>{r.locality || "—"}</span>
                    <span style={{ color: "#666", fontSize: 13, marginLeft: 10 }}>{r.town}</span>
                  </div>
                  {r.street && (
                    <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{r.street}</div>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontFamily: "monospace",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#a0c4ff",
                    letterSpacing: 1,
                  }}>
                    {r.postcode}
                  </span>
                  <span style={{ fontSize: 12, color: copied === r.postcode ? "#6fcf97" : "#444", minWidth: 40 }}>
                    {copied === r.postcode ? "✓ copied" : "copy"}
                  </span>
                </div>
              </div>
            ))}
            {results.length === 50 && (
              <p style={{ textAlign: "center", color: "#555", fontSize: 13, marginTop: 8 }}>
                Showing first 50 results — refine your search
              </p>
            )}
          </div>
        )}

        {query.length >= 2 && !loading && results.length === 0 && (
          <p style={{ textAlign: "center", color: "#555", fontSize: 14, marginTop: 40 }}>
            No results for "{query}"
          </p>
        )}

        {/* Footer */}
        <p style={{ textAlign: "center", color: "#333", fontSize: 12, marginTop: 60 }}>
          2,010 postcodes · Click any row to copy the postcode
        </p>
      </div>
    </main>
  );
}
