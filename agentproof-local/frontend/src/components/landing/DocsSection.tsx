import React, { useState } from "react"
import { BookOpen, Terminal, Copy, Check, Shield, Cpu, Code } from "lucide-react"

export function DocsSection() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const SNIPPETS = [
    {
      title: "1. Quickstart & Installation",
      desc: "Clone repository, create virtual environment, and install dependencies:",
      code: `git clone https://github.com/shreyashbhosale/AgentGuard.git
cd AgentGuard/agentproof-local
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m pytest -v`,
    },
    {
      title: "2. Connect Local Ollama (Optional)",
      desc: "Run a quantized local model without internet access or external API costs:",
      code: `ollama run gemma4:e2b-it-qat
curl http://localhost:11434/api/tags`,
    },
    {
      title: "3. Start Backend & Modern Frontend",
      desc: "Launch the FastAPI security server and Vite React dashboard:",
      code: `# Terminal 1: Backend REST Engine
uvicorn agentproof.server:app --host 127.0.0.1 --port 8000

# Terminal 2: Modern 3D Web UI
cd frontend && npm run dev -- --port 5173`,
    },
  ]

  return (
    <section id="docs" className="relative py-24 bg-transparent text-[#F5F7FC] border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1 text-xs font-mono font-medium text-white mb-3">
            <BookOpen className="h-3.5 w-3.5 text-white" />
            <span>DEVELOPER DOCUMENTATION</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#F5F7FC]">
            Simple Integration. Provable Safety.
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#A3A9B7]">
            Deploy locally in less than 3 minutes. Air-gapped, zero-telemetry, and fully open-source.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SNIPPETS.map((snippet, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0A0C11]/80 p-6 backdrop-blur-xl shadow-xl"
            >
              <div>
                <div className="text-xs font-mono font-bold text-white mb-1">
                  {snippet.title}
                </div>
                <p className="text-xs text-[#A3A9B7] mb-4 leading-relaxed">
                  {snippet.desc}
                </p>
              </div>

              <div className="relative rounded-xl border border-white/5 bg-[#050608] p-4 text-xs font-mono text-[#A3A9B7]">
                <button
                  onClick={() => copyToClipboard(snippet.code, idx)}
                  className="absolute top-3 right-3 text-[#727B8D] hover:text-[#F5F7FC] p-1 rounded hover:bg-white/5 transition-colors"
                  title="Copy command"
                >
                  {copiedIndex === idx ? (
                    <Check className="h-3.5 w-3.5 text-[#35C98A]" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed pr-6">
                  {snippet.code}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
