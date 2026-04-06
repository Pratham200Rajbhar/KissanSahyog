import os
import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import transforms, models
from torchvision.models import resnet50, densenet121, ResNet50_Weights, DenseNet121_Weights
from PIL import Image
import logging
from app.core.config import settings
from app.core.hf_utils import ensure_model_file
from app.services.chatbot_service import client, MODEL_NAME

logger = logging.getLogger(__name__)

# ── SE Block Definition ───────────────────────────────────────────────────────
class SEBlock(nn.Module):
    def __init__(self, channels: int, reduction: int = 16):
        super().__init__()
        self.se = nn.Sequential(
            nn.Linear(channels, channels // reduction, bias=False),
            nn.ReLU(inplace=True),
            nn.Linear(channels // reduction, channels, bias=False),
            nn.Sigmoid()
        )

    def forward(self, x):
        scale = self.se(x)
        return x * scale

# ── Hybrid Model Definition ───────────────────────────────────────────────────
class HybridResNetDenseNet(nn.Module):
    def __init__(
        self,
        num_classes:  int,
        hidden_dim:   int   = 1024,
        dropout:      float = 0.4,
        pretrained:   bool  = False,
    ):
        super().__init__()

        RESNET_FEAT_DIM   = 2048
        DENSENET_FEAT_DIM = 1024
        FUSED_DIM         = RESNET_FEAT_DIM + DENSENET_FEAT_DIM

        # ResNet50 Backbone
        res_weights  = ResNet50_Weights.IMAGENET1K_V2 if pretrained else None
        res_model    = resnet50(weights=res_weights)
        self.resnet_backbone = nn.Sequential(*list(res_model.children())[:-1])

        # DenseNet121 Backbone
        den_weights   = DenseNet121_Weights.IMAGENET1K_V1 if pretrained else None
        den_model     = densenet121(weights=den_weights)
        self.densenet_backbone = den_model.features
        self.densenet_pool     = nn.AdaptiveAvgPool2d((1, 1))

        # Fusion & Attention
        self.fusion_norm = nn.BatchNorm1d(FUSED_DIM)
        self.se_block    = SEBlock(FUSED_DIM, reduction=16)

        # MLP Classifier
        self.classifier = nn.Sequential(
            nn.Linear(FUSED_DIM, hidden_dim),
            nn.BatchNorm1d(hidden_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_dim, hidden_dim // 2),
            nn.BatchNorm1d(hidden_dim // 2),
            nn.GELU(),
            # nn.Dropout(dropout / 2), # Removed as dropout is float
            nn.Dropout(p=dropout / 2),
            nn.Linear(hidden_dim // 2, num_classes),
        )

    def forward(self, x):
        res_feat = self.resnet_backbone(x)
        res_feat = res_feat.flatten(1)

        den_feat = self.densenet_backbone(x)
        den_feat = F.relu(den_feat, inplace=True)
        den_feat = self.densenet_pool(den_feat)
        den_feat = den_feat.flatten(1)

        fused = torch.cat([res_feat, den_feat], dim=1)
        fused = self.fusion_norm(fused)
        fused = self.se_block(fused)

        return self.classifier(fused)

class CropDiseaseService:
    def __init__(self, model_path: str):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model_path = model_path
        self.model = None
        self.class_names = None
        self.img_size = 224
        self.transform = transforms.Compose([
            transforms.Resize((self.img_size, self.img_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406],
                                 std =[0.229, 0.224, 0.225]),
        ])
        self._load_model()

    def _load_model(self):
        try:
            # Ensure model artifact exists via HF Hub
            model_filename = os.path.basename(self.model_path)
            model_dir = os.path.dirname(self.model_path)
            ensure_model_file(settings.disease_model_repo, model_filename, model_dir)

            logger.info(f"Loading crop disease model from {self.model_path}...")
            checkpoint = torch.load(self.model_path, map_location=self.device, weights_only=False)
            self.class_names = checkpoint['class_names']
            num_classes = checkpoint['num_classes']
            hidden_dim = checkpoint.get('hidden_dim', 1024)
            dropout = checkpoint.get('dropout', 0.4)

            self.model = HybridResNetDenseNet(
                num_classes=num_classes,
                hidden_dim=hidden_dim,
                dropout=dropout,
                pretrained=False
            )
            self.model.load_state_dict(checkpoint['model_state_dict'])
            self.model.to(self.device)
            self.model.eval()
            logger.info(f"Crop disease model loaded successfully with {num_classes} classes.")
        except Exception as e:
            logger.error(f"Error loading crop disease model: {str(e)}")

    def predict(self, image_bytes, top_k=5):
        if self.model is None:
            return {"error": "Model not loaded"}

        try:
            img = Image.open(image_bytes).convert('RGB')
            tensor = self.transform(img).unsqueeze(0).to(self.device)

            with torch.no_grad():
                logits = self.model(tensor)
                probs = F.softmax(logits, dim=1).squeeze(0)

            top_probs, top_idx = probs.topk(min(top_k, len(self.class_names)))
            
            results = []
            for i in range(len(top_probs)):
                idx = top_idx[i].item()
                prob = top_probs[i].item()
                results.append({
                    "class": self.class_names[idx].split("___")[-1].replace("_", " "),
                    "raw_class": self.class_names[idx],
                    "confidence": float(prob)
                })

            return results
        except Exception as e:
            logger.error(f"Prediction error: {str(e)}")
            return {"error": str(e)}

    async def get_disease_insights(self, disease_name: str) -> str:
        """Generates detailed insights and solutions for a specific crop disease using Gemini AI."""
        if not client:
            return "AI Insights currently unavailable. Please consult a local agricultural expert."

        prompt = f"""
        You are Kissan Mitra, a friendly and helpful Smart Farming Friend. 
        Provide a **very simple** and **direct** report for this plant health check:
        
        Seen Problem: {disease_name}
        
        Steps for the Farmer (Use only basic words):
        1. **What is it?**: 1 simple sentence. 
        2. **Why it happened**: Give 1 easy reason (like "Too much rain" or "Dirty tools").
        3. **How to fix it now**:
           - **Organic**: One simple natural way.
           - **Chemical**: One primary medicine if needed.
        4. **Two tips to stop it from coming back**: Easy habits the farmer can do.
        
        Tone: Friendly, simple, and encouraging. No big words or business talk.
        Format: Use Markdown (### and bullets). No introductions.
        """

        try:
            response = await client.aio.models.generate_content(
                model=MODEL_NAME,
                contents=prompt
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini Insights Error for {disease_name}: {e}")
            return "I could identify the disease, but I'm having trouble providing detailed insights right now. Please check standard agricultural practices for this condition."

# Singleton instance
MODEL_FILE = settings.disease_model_path
crop_disease_service = CropDiseaseService(MODEL_FILE)
