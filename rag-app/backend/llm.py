"""
LLMHandler — load a HuggingFace model via transformers and expose a generate() helper.
"""

from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, pipeline as hf_pipeline

from config import settings


class LLMHandler:
    """Load a HuggingFace model once and reuse for every query."""

    def __init__(self) -> None:
        model_name = settings.HF_MODEL_NAME

        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

        # Determine the model's maximum input token length
        self.max_input_tokens = getattr(
            self.model.config, "n_positions",
            getattr(self.tokenizer, "model_max_length", 512),
        )
        # flan-t5 variants report a very large model_max_length; cap it
        if self.max_input_tokens > 100_000:
            self.max_input_tokens = 512

        self.pipe = hf_pipeline(
            "text2text-generation",
            model=self.model,
            tokenizer=self.tokenizer,
            max_new_tokens=settings.MAX_NEW_TOKENS,
            do_sample=False,
            truncation=True,
        )

    # ------------------------------------------------------------------

    def truncate_prompt(self, prompt: str) -> str:
        """Truncate *prompt* so its token count fits the model's encoder."""
        token_ids = self.tokenizer.encode(prompt, add_special_tokens=False)
        if len(token_ids) <= self.max_input_tokens - 2:  # room for special tokens
            return prompt
        truncated = token_ids[: self.max_input_tokens - 2]
        return self.tokenizer.decode(truncated, skip_special_tokens=True)

    def count_tokens(self, text: str) -> int:
        """Return the number of tokens in *text*."""
        return len(self.tokenizer.encode(text, add_special_tokens=False))

    def generate(self, prompt: str) -> str:
        """Run the model and return the generated text."""
        prompt = self.truncate_prompt(prompt)
        result = self.pipe(prompt)
        return result[0]["generated_text"].strip()
