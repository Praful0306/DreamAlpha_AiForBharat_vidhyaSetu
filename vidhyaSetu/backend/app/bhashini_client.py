"""
bhashini_client.py
==================
Handles translation and speech via Bhashini (India's AI language platform).

When MOCK_MODE=true or BHASHINI_API_KEY is not set, all functions return
the input text unchanged (mock pass-through mode).

Bhashini services used:
  - NMT (Neural Machine Translation): text → text in another language
  - ASR (Automatic Speech Recognition): audio → text  [future]
  - TTS (Text to Speech): text → audio  [future]
"""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

MOCK_MODE = os.getenv("MOCK_MODE", "true").lower() == "true"
BHASHINI_API_KEY = os.getenv("BHASHINI_API_KEY", "")
BHASHINI_USER_ID = os.getenv("BHASHINI_USER_ID", "")

# Bhashini API endpoints
BHASHINI_PIPELINE_URL = "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline"
BHASHINI_INFERENCE_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

# Language code mapping (ISO → Bhashini)
LANGUAGE_CODES = {
    "en": "en",
    "kn": "kn",  # Kannada
    "hi": "hi",  # Hindi
    "ta": "ta",  # Tamil
    "te": "te",  # Telugu
}


async def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    """
    Translate text from source_lang to target_lang using Bhashini NMT.

    Example:
        translated = await translate_text("What is gravity?", "en", "kn")
        # Returns: "ಗುರುತ್ವಾಕರ್ಷಣೆ ಎಂದರೇನು?"

    Falls back to returning original text if Bhashini is not configured.
    """

    # ── Mock / no-API mode ────────────────────────────────────────────────────
    if MOCK_MODE or not BHASHINI_API_KEY:
        print(f"ℹ️  Bhashini mock: returning original text (no translation)")
        return text  # Return unchanged — Claude will handle the language

    # ── Real Bhashini NMT call ────────────────────────────────────────────────
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # Step 1: Get the pipeline config for this language pair
            pipeline_payload = {
                "pipelineTasks": [{"taskType": "translation"}],
                "pipelineRequestConfig": {
                    "pipelineId": "64392f96daac500b55c543cd"
                }
            }

            headers = {
                "userID": BHASHINI_USER_ID,
                "ulcaApiKey": BHASHINI_API_KEY,
                "Content-Type": "application/json"
            }

            pipeline_resp = await client.post(
                BHASHINI_PIPELINE_URL,
                json=pipeline_payload,
                headers=headers
            )
            pipeline_data = pipeline_resp.json()

            # Step 2: Run the translation inference
            service_id = (
                pipeline_data.get("pipelineResponseConfig", [{}])[0]
                .get("config", [{}])[0]
                .get("serviceId", "")
            )

            inference_payload = {
                "pipelineTasks": [
                    {
                        "taskType": "translation",
                        "config": {
                            "language": {
                                "sourceLanguage": LANGUAGE_CODES.get(source_lang, source_lang),
                                "targetLanguage": LANGUAGE_CODES.get(target_lang, target_lang)
                            },
                            "serviceId": service_id
                        }
                    }
                ],
                "inputData": {
                    "input": [{"source": text}]
                }
            }

            inference_resp = await client.post(
                BHASHINI_INFERENCE_URL,
                json=inference_payload,
                headers={"Authorization": pipeline_data.get("pipelineInferenceAPIEndPoint", {}).get("inferenceApiKey", {}).get("value", "")}
            )
            result = inference_resp.json()

            translated = (
                result.get("pipelineResponse", [{}])[0]
                .get("output", [{}])[0]
                .get("target", text)
            )
            return translated

    except Exception as e:
        print(f"⚠️  Bhashini translation failed: {e}. Returning original text.")
        return text
