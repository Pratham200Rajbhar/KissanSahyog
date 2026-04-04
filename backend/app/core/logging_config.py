import logging
import sys
import json
import warnings
from datetime import datetime
from app.core import logging_context

# Sensitive keys to mask in logs
SENSITIVE_KEYS = {"password", "secret", "token", "key", "authorization"}

# Suppress sklearn version warnings during start-up
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

class StructuredTextFormatter(logging.Formatter):
    def format(self, record):
        timestamp = datetime.fromtimestamp(record.created).strftime("%Y-%m-%d %H:%M:%S")
        level = record.levelname
        module = record.module
        message = record.getMessage()
        
        ctx = logging_context.get_logging_context()
        request_id = ctx.get("request_id")
        user_email = ctx.get("user_email")
        
        # Build context string
        ctx_parts = []
        if request_id:
            # Use short ID for readability
            ctx_parts.append(f"req:{request_id[:8]}")
        if user_email:
            ctx_parts.append(f"user:{user_email}")
        ctx_str = f" [{', '.join(ctx_parts)}]" if ctx_parts else ""
        
        # Build extra data string (excluding sensitive keys)
        extra_data = ""
        if hasattr(record, "extra_info") and isinstance(record.extra_info, dict):
            items = []
            for k, v in record.extra_info.items():
                if any(sk in k.lower() for sk in SENSITIVE_KEYS):
                    items.append(f"{k}=********")
                else:
                    items.append(f"{k}={v}")
            if items:
                extra_data = f" | {', '.join(items)}"
                
        log_line = f"{timestamp} | {level:7} | {module:12} |{ctx_str} {message}{extra_data}"
        
        if record.exc_info:
            log_line += "\n" + self.formatException(record.exc_info)
            
        return log_line

def setup_logging():
    # Setup our handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredTextFormatter())
    
    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Clear any existing root handlers to avoid duplicates
    if root_logger.hasHandlers():
        root_logger.handlers.clear()
        
    root_logger.addHandler(handler)
    
    # Silence and redirect loggers to our handler
    # We set noisy third-party loggers to WARNING to keep only important info
    noisy_loggers = [
        "uvicorn", 
        "uvicorn.access", 
        "uvicorn.error", 
        "fastapi", 
        "httpx", 
        "httpcore", 
        "watchfiles", 
        "multipart"
    ]
    
    for logger_name in noisy_loggers:
        target_logger = logging.getLogger(logger_name)
        target_logger.handlers = [handler]
        target_logger.propagate = False
        
        # Silence uvicorn access logs specifically since we have custom middleware
        if logger_name in ["uvicorn.access", "httpx", "httpcore", "watchfiles"]:
            target_logger.setLevel(logging.WARNING)
        else:
            target_logger.setLevel(logging.INFO)
