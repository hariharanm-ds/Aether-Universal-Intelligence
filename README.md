<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/3f658594-5dd3-4f2c-9bb8-b4b1e03ac116

## Run Locally

**Prerequisites:**  Node.js and Python 3.11+

1. Install frontend dependencies:
   `npm install`
2. Install backend dependencies:
   `python -m pip install -r backend/requirements.txt`
3. Set `LLAMA_MODEL_PATH` in your environment to a local LLaMA GGUF model file.
   Example: `LLAMA_MODEL_PATH=models/llama-2-7b.gguf`
4. Start the Python backend:
   `npm run backend`
5. Start the frontend:
   `npm run dev`
