import os
import logging
from huggingface_hub import hf_hub_download
from app.core.config import settings

logger = logging.getLogger(__name__)

def ensure_model_file(repo_name: str, filename: str, local_dir: str) -> str:
    """
    Ensures that a specific model file exists locally. 
    If not, downloads it from the specified Hugging Face repository.
    
    Args:
        repo_name (str): The name of the repository (without username).
        filename (str): The specific file to download/check.
        local_dir (str): The local directory where the file should reside.
                                  
    Returns:
        str: The absolute path to the local file.
    """
    repo_id = f"{settings.hf_username}/{repo_name}"
    
    # Ensure local directory exists
    os.makedirs(local_dir, exist_ok=True)
    local_path = os.path.join(local_dir, filename)

    if os.path.exists(local_path):
        logger.debug(f"File {filename} already exists at {local_path}")
        return local_path

    logger.info(f"🚀 Downloading '{filename}' from Hugging Face Hub ({repo_id})...")
    try:
        downloaded_path = hf_hub_download(
            repo_id=repo_id,
            filename=filename,
            local_dir=local_dir,
            local_dir_use_symlinks=False  # Ensure fixed files for open-source simplicity
        )
        logger.info(f"✅ Successfully downloaded {filename} to {downloaded_path}")
        return downloaded_path
    except Exception as e:
        logger.error(f"❌ Failed to download {filename} from Hugging Face: {e}")
        # In open-source context, failure to download is fatal for the specific service
        raise FileNotFoundError(f"Required model artifact {filename} could not be retrieved from {repo_id}")
