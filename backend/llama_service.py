import base64
import json
import os
import re
import time
from typing import Any, Dict, Optional

import requests

OLLAMA_API_URL = os.environ.get("OLLAMA_API_URL", "http://localhost:11434")
DEFAULT_MODEL = os.environ.get("OLLAMA_MODEL", "llama2")

SYSTEM_PROMPT = """
You are the AETHER Neural Core, a high-level intelligence synthesis engine.
Your goal is to transform raw data into actionable intelligence with precision.

CRITICAL DIRECTIVE:
- Extract intelligence from the provided context.
- If a file is provided, treat it as the primary source of truth.
- Do not hallucinate information not supported by the input.
- If the query cannot be answered from the input, reply with "Insufficient data in provided source."

Output MUST be valid JSON with the exact format shown below.
"""

OUTPUT_SCHEMA = {
    "answer": "string",
    "reasoning": ["string"],
    "sources": ["string"],
    "metadata": {
        "confidence": "number",
        "tokens": "number",
        "latency": "string"
    }
}


def check_ollama_health() -> bool:
    """Check if Ollama service is running."""
    try:
        response = requests.get(f"{OLLAMA_API_URL}/api/tags", timeout=2)
        return response.status_code == 200
    except Exception:
        return False


def extract_base64_text(data: str) -> str:
    if "," in data:
        return data.split(",", 1)[1]
    return data


def decode_file_data(file_data: Dict[str, str]) -> str:
    data = extract_base64_text(file_data.get("data", ""))
    mime_type = file_data.get("mimeType", "")
    raw = base64.b64decode(data)

    if mime_type.startswith("text/") or mime_type in {"application/json", "application/javascript", "application/xml", "application/xhtml+xml", "application/ld+json"}:
        return raw.decode("utf-8", errors="ignore")

    if mime_type == "application/pdf":
        return "[PDF binary content omitted. PDF parsing is not supported in this backend.]"

    if mime_type.startswith("image/"):
        return f"[Image content of type {mime_type} received. Use a text or code file for best results.]"

    return f"[Binary content received with MIME type {mime_type}. Unable to parse into text.]"


def safe_extract_json(text: str) -> Optional[Dict[str, Any]]:
    trimmed = text.strip()
    if not trimmed:
        return None

    first = trimmed.find("{")
    last = trimmed.rfind("}")
    if first >= 0 and last > first:
        trimmed = trimmed[first:last + 1]

    cleaned = re.sub(r"\n+", " ", trimmed)
    cleaned = re.sub(r"\"\"", '"', cleaned)

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return None


def format_prompt(query: str, file_data: Optional[Dict[str, str]], config: Dict[str, Any]) -> str:
    prompt = SYSTEM_PROMPT
    prompt += "\n\nUSER QUERY: " + query.strip() + "\n\n"

    if file_data:
        prompt += "SOURCE DATA:\n"
        prompt += decode_file_data(file_data)
        prompt += "\n\n"

    if config.get("useGrounding"):
        prompt += "Prefer evidence-based reasoning and cite sources.\n\n"

    prompt += (
        "Respond with valid JSON exactly matching this structure:\n"
        "{\n"
        '  "answer": "string",\n'
        '  "reasoning": ["string"],\n'
        '  "sources": ["string"],\n'
        '  "metadata": {\n'
        '    "confidence": 0.95,\n'
        '    "tokens": 512\n'
        "  }\n"
        "}\n"
    )

    return prompt


def analyze_query(query: str, file_data: Optional[Dict[str, str]], config: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze query using Ollama API."""
    model = config.get("model", DEFAULT_MODEL)
    temperature = float(config.get("temperature", 0.4))
    start = time.time()

    # Check Ollama is running
    if not check_ollama_health():
        raise ConnectionError(
            f"Ollama service is not running. Start it with: ollama serve\n"
            f"Then pull a model: ollama pull {model}"
        )

    prompt = format_prompt(query, file_data, config)

    try:
        response = requests.post(
            f"{OLLAMA_API_URL}/api/generate",
            json={
                "model": model,
                "prompt": prompt,
                "temperature": temperature,
                "stream": False,
            },
            timeout=60
        )
        response.raise_for_status()
    except requests.exceptions.ConnectionError:
        raise ConnectionError(
            f"Could not connect to Ollama at {OLLAMA_API_URL}.\n"
            f"Make sure Ollama is running: ollama serve"
        )
    except requests.exceptions.Timeout:
        raise TimeoutError(f"Ollama request timed out. Model {model} may be too large for your system.")

    latency = f"{(time.time() - start):.2f}s"
    result_data = response.json()
    text = result_data.get("response", "").strip()
    parsed = safe_extract_json(text)

    if parsed and isinstance(parsed, dict):
        metadata = parsed.get("metadata", {})
        metadata["latency"] = latency
        metadata.setdefault("confidence", 0.85)
        metadata.setdefault("tokens", len(prompt.split()))
        parsed["metadata"] = metadata
        parsed.setdefault("answer", text)
        parsed.setdefault("reasoning", ["Analysis completed by LLaMA via Ollama."])
        parsed.setdefault("sources", ["Primary input data"])
        return parsed

    return {
        "answer": text or "No response produced.",
        "reasoning": [
            "LLaMA produced a response.",
            "The output could not be parsed as structured JSON.",
            "Verify the model and Ollama setup."
        ],
        "sources": ["Primary input data"],
        "metadata": {
            "confidence": 0.72,
            "tokens": len(prompt.split()),
            "latency": latency,
        },
    }
