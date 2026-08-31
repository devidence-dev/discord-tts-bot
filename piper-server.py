from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
import subprocess
import os
from pathlib import Path
import tempfile
import json
import threading
import time

app = FastAPI(title="Piper TTS Service")

MODELS_DIR = Path("/opt/app/piper-models")
TMP_DIR = Path("/tmp")
FILE_TIMEOUT = 5 * 60  # 5 minutes in seconds

def cleanup_old_files():
    """
    Cleans up old Piper files.
    Runs every minute.
    """
    while True:
        try:
            current_time = time.time()
            for file_path in TMP_DIR.glob("piper_*.wav"):
                file_age = current_time - file_path.stat().st_mtime
                if file_age > FILE_TIMEOUT:
                    file_path.unlink()
                    print(f"Deleted old file: {file_path}")
        except Exception as e:
            print(f"Cleanup error: {e}")
        
        time.sleep(60)  # Run every minute.

# Start the cleaner in a background thread.
cleanup_thread = threading.Thread(target=cleanup_old_files, daemon=True)
cleanup_thread.start()

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/models")
async def list_models():
    """
    List all available models.
    """
    try:
        models = []
        
        # Scan the models directory.
        if MODELS_DIR.exists():
            for model_folder in MODELS_DIR.iterdir():
                if model_folder.is_dir():
                    model_name = model_folder.name
                    model_file = model_folder / f"{model_name}.onnx"
                    
                    if model_file.exists():
                        # Get model information.
                        size_mb = model_file.stat().st_size / (1024 * 1024)
                        
                        # Parse the name: language-voice.
                        parts = model_name.split('-')
                        if len(parts) >= 2:
                            language = f"{parts[0]}-{parts[1]}"
                            voice = parts[2] if len(parts) > 2 else "unknown"
                        else:
                            language = "unknown"
                            voice = "unknown"
                        
                        models.append({
                            "name": model_name,
                            "language": language,
                            "voice": voice,
                            "size_mb": round(size_mb, 2),
                            "available": True
                        })
        
        return {
            "total": len(models),
            "models": sorted(models, key=lambda x: x["name"])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/synthesize")
async def synthesize(text: str, language: str = "es_MX", voice: str = "ald", speed: str = "normal"):
    """
    Synthesize text to speech using Piper TTS.

    Parameters:
    - text: Text to synthesize.
    - language: Language (e.g., es_MX, en_US).
    - voice: Voice (e.g., ald, amy).
    - speed: Speed (fast, normal, slow).
    """
    try:
        # Build the model path.
        model_name = f"{language}-{voice}"
        model_path = MODELS_DIR / model_name / model_name
        
        # Verify that it exists.
        if not (model_path.with_suffix(".onnx")).exists():
            raise HTTPException(
                status_code=404, 
                detail=f"Model not found: {model_name}. Available models: GET /models"
            )
        
        # Generate a temporary file.
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            temp_file = tmp.name
        
        # Calculate the speed scale.
        speed_scales = {
            "fast": "0.8",
            "normal": "1.0",
            "slow": "1.2"
        }
        speed_scale = speed_scales.get(speed, "1.0")
        
        # Run Piper.
        cmd = [
            "python3", "-m", "piper",
            "--model", str(model_path),
            "--output-file", temp_file,
            "--length-scale", speed_scale
        ]
        
        process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        stdout, stderr = process.communicate(input=text.encode())
        
        if process.returncode != 0:
            os.unlink(temp_file)
            raise HTTPException(
                status_code=500,
                detail=f"Piper error: {stderr.decode()}"
            )
        
        # Verify that the file was created.
        if not os.path.exists(temp_file):
            raise HTTPException(status_code=500, detail="Failed to generate audio")
        
        return FileResponse(
            temp_file,
            media_type="audio/wav",
            filename=f"{model_name}.wav"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
