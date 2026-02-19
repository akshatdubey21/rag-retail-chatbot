"""
LLMHandler — load a HuggingFace model via transformers and expose a generate() helper.
"""

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline

from config import settings


class LLMHandler:
    """Load a HuggingFace model once and reuse for every query."""

    def __init__(self) -> None:
        model_name = settings.HF_MODEL_NAME

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

        self.pipe = pipeline(
            "text2text-generation",
            model=self.model,
            tokenizer=self.tokenizer,
            max_new_tokens=settings.MAX_NEW_TOKENS,
            do_sample=False,
        )

    def generate(self, prompt: str) -> str:
        """Run the model and return the generated text."""
        result = self.pipe(prompt)
        return result[0]["generated_text"].strip()
