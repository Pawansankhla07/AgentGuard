/**
 * Optional Local Ollama AI Integration for AgentProof Chrome Extension.
 *
 * Connects directly to local Ollama (http://127.0.0.1:11434) to produce
 * concise plain-English summaries of already-collected, sanitised findings.
 *
 * Deterministic risk scores are NEVER modified or overridden by LLM output.
 * Cookies and credentials are NEVER sent to the model.
 */

const OLLAMA_DEFAULT_URL = 'http://127.0.0.1:11434';
const DEFAULT_MODEL = 'gemma4:e2b-it-qat';

/**
 * Check if local Ollama daemon is reachable
 */
export async function checkOllamaAvailability(baseUrl = OLLAMA_DEFAULT_URL) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const resp = await fetch(`${baseUrl}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      const models = (data.models || []).map((m) => m.name);
      return {
        available: true,
        models,
        recommendedModel: models.includes(DEFAULT_MODEL) ? DEFAULT_MODEL : models[0] || DEFAULT_MODEL,
      };
    }
    return { available: false, error: `HTTP ${resp.status}` };
  } catch (err) {
    return { available: false, error: 'Ollama is offline or unreachable' };
  }
}

/**
 * Request an advisory summary of sanitised findings from local Ollama
 *
 * @param {Object} sanitisedContext - Abstract findings and score
 * @param {string} modelName - Target local model name
 * @returns {Promise<string>} Summary text
 */
export async function generateOllamaSummary(sanitisedContext, modelName = DEFAULT_MODEL) {
  const { hostname, score, riskLevel, recommendation, findings } = sanitisedContext;

  const abstractSummary = (findings || []).map((f) => ({
    title: f.title,
    severity: f.severity,
    category: f.category,
    remediation: f.remediation,
  }));

  const prompt = `You are an AI Security Advisor assisting a user in evaluating login risks for a website.
The deterministic security engine has already evaluated this site and its decision is authoritative.
Do not alter the risk score or contradict the recommendation.

Observed Website: ${hostname}
Deterministic Risk Score: ${score}/100 (${riskLevel} Risk)
Official Engine Recommendation: "${recommendation}"

Technical Findings:
${JSON.stringify(abstractSummary, null, 2)}

Provide a concise, 2-3 sentence executive summary explaining the main risks to the user and reinforcing the recommended action. Be objective, calm, and practical.`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    const resp = await fetch(`${OLLAMA_DEFAULT_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: modelName,
        prompt,
        stream: false,
        options: { temperature: 0.1 },
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!resp.ok) {
      throw new Error(`Ollama returned status ${resp.status}`);
    }

    const data = await resp.json();
    return data.response ? data.response.trim() : 'No response from local model.';
  } catch (err) {
    return `Local AI summarization unavailable (${err.message}). Deterministic safety evaluation remains authoritative.`;
  }
}
