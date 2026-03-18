import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);

      const res = await axios.post(
        "http://localhost:5000/api/code/search",
        { query }
      );

      setResults((prev) => [
        ...prev,
        {
          query,
          answer: res.data.explanation,
          snippets: res.data.retrievedSnippets || [],
        },
      ]);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

    setQuery("");
  };

  const handleUpload = async (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);

    for (let file of selected) {
      const formData = new FormData();
      formData.append("file", file);

      await axios.post("http://localhost:5000/api/code/upload", formData);
    }
  };

  return (
    <div className="h-screen bg-[#0d0d0d] text-white flex flex-col">

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto px-6 py-6 max-w-3xl w-full mx-auto">

        {/* EMPTY STATE */}
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center mt-40">
            <h1 className="text-3xl text-gray-400 mb-6">
              What’s on your mind today?
            </h1>
          </div>
        )}

        {/* RESULTS */}
        <div className="space-y-10">
          {results.map((r, i) => (
            <div key={i}>

              {/* USER QUERY */}
              <div className="text-gray-400 mb-2">
                {r.query}
              </div>

              {/* AI RESPONSE */}
              <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-700">
                <ReactMarkdown
                  components={{
                    code({ inline, className, children }) {
                      const match = /language-(\w+)/.exec(className || "");

                      return !inline ? (
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match ? match[1] : "javascript"}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-700 px-1 rounded">
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {r.answer}
                </ReactMarkdown>
              </div>

              {/* SNIPPETS */}
              {r.snippets.map((s, idx) => (
                <div
                  key={idx}
                  className="mt-3 bg-[#111] p-4 rounded-xl border border-gray-800"
                >
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>{s.filename}</span>
                    <span>{s.score?.toFixed(2)}</span>
                  </div>

                  <SyntaxHighlighter language="javascript" style={oneDark}>
                    {s.snippetText}
                  </SyntaxHighlighter>
                </div>
              ))}
            </div>
          ))}
        </div>

        {loading && (
          <p className="text-gray-400 mt-6">Thinking...</p>
        )}
      </div>

      {/* INPUT BAR (BOTTOM) */}
      <div className="border-t border-gray-800 p-4 bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto">

          <div className="flex items-center bg-[#1a1a1a] rounded-full px-4 py-3 border border-gray-700">

            {/* ATTACH */}
            <label className="cursor-pointer text-gray-400 hover:text-white">
              📎
              <input
                type="file"
                multiple
                onChange={handleUpload}
                className="hidden"
              />
            </label>

            {/* INPUT */}
            <input
              className="flex-1 bg-transparent outline-none px-3"
              placeholder="Ask anything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />

            {/* SEND */}
            <button
              onClick={handleSearch}
              className="bg-white text-black px-4 py-1 rounded-full"
            >
              ↑
            </button>
          </div>

          {/* FILES */}
          {files.length > 0 && (
            <div className="text-sm text-gray-400 mt-2">
              {files.length} file(s): {files.map(f => f.name).join(", ")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}