import base64
import json
import os
import re
import time
from io import BytesIO
from typing import Any, Dict, Optional

from groq import Groq
from pypdf import PdfReader

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
DEFAULT_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")
print("GROQ_API_KEY exists:", bool(os.getenv("GROQ_API_KEY")))
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


def validate_groq_key() -> bool:
    """Validate that Groq API key is available."""
    if not GROQ_API_KEY:
        return False
    return len(GROQ_API_KEY) > 0


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
        try:
            pdf_reader = PdfReader(BytesIO(raw))
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            if text.strip():
                return text
            else:
                return "[PDF file is empty or contains only images.]"
        except Exception as e:
            return f"[PDF parsing error: {str(e)}]"

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
    """Analyze query using Groq API."""
    if not validate_groq_key():
        raise ValueError(
            "Groq API key is not set. Please set the GROQ_API_KEY environment variable."
        )

    model = config.get("model", DEFAULT_MODEL)
    temperature = float(config.get("temperature", 0.4))
    start = time.time()

    prompt = format_prompt(query, file_data, config)

    try:
        client = Groq(api_key=GROQ_API_KEY)
        message = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=temperature,
            max_tokens=1024,
        )
        text = message.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Groq API request failed: {str(e)}")

    latency = f"{(time.time() - start):.2f}s"
    parsed = safe_extract_json(text)

    if parsed and isinstance(parsed, dict):
        metadata = parsed.get("metadata", {})
        metadata["latency"] = latency
        metadata.setdefault("confidence", 0.85)
        metadata.setdefault("tokens", len(prompt.split()))
        parsed["metadata"] = metadata
        parsed.setdefault("answer", text)
        parsed.setdefault("reasoning", ["Analysis completed by Groq LLaMA 3.1."])
        parsed.setdefault("sources", ["Primary input data"])
        return parsed

    return {
        "answer": text or "No response produced.",
        "reasoning": [
            "Groq produced a response.",
            "The output could not be parsed as structured JSON.",
            "Please verify the input and try again."
        ],
        "sources": ["Primary input data"],
        "metadata": {
            "confidence": 0.72,
            "tokens": len(prompt.split()),
            "latency": latency,
        },
    }
