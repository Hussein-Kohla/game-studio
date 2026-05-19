#!/usr/bin/env python3
"""
seed_content.py
================
Automatically generates unlimited non-repeating Arabic words and image prompts
for the Ultimate Party Games platform using Pollinations.ai Text API (FREE, no key needed).

Pushes generated content directly to Convex database.

Usage:
    python scripts/seed_content.py            # Generate 10 words + 10 prompts
    python scripts/seed_content.py --words 30 # Generate 30 forbidden-words entries
    python scripts/seed_content.py --prompts 20 # Generate 20 image prompts
    python scripts/seed_content.py --words 50 --prompts 50  # Both

Requirements:
    pip install requests python-dotenv
"""

import argparse
import json
import os
import re
import time
import urllib.parse
from pathlib import Path
import requests
from dotenv import load_dotenv

# ── Load .env.local to get Convex URL ─────────────────────────────────────────
ROOT = Path(__file__).parent.parent
load_dotenv(ROOT / ".env.local")
CONVEX_URL = os.getenv("VITE_CONVEX_URL", "").rstrip("/")

if not CONVEX_URL:
    raise SystemExit("VITE_CONVEX_URL not found in .env.local")

print(f"Convex URL: {CONVEX_URL}")


# ── Pollinations Text API ─────────────────────────────────────────────────────

def ask_pollinations(prompt: str, timeout: int = 90) -> str:
    """Call Pollinations.ai Text API using POST to avoid URL limits."""
    import random
    seed = random.randint(1, 9999999)
    url = "https://text.pollinations.ai/openai"
    payload = {
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "model": "mistral",
        "seed": seed
    }
    
    resp = requests.post(url, json=payload, timeout=timeout)
    resp.raise_for_status()
    
    # Extract the actual text content from the OpenAI-compatible response
    data = resp.json()
    if "choices" in data and len(data["choices"]) > 0:
        return data["choices"][0]["message"]["content"].strip()
    return resp.text.strip()


def extract_json(text: str) -> list:
    """Extract a JSON array from LLM response (handles markdown code blocks)."""
    # Remove markdown code fences if present
    clean_text = re.sub(r"```(?:json)?", "", text).strip().rstrip("`").strip()

    # Find the first '[' and last ']'
    start = clean_text.find("[")
    end = clean_text.rfind("]")
    if start == -1 or end == -1:
        print(f"\n[DEBUG] Raw text received:\n{text}\n")
        raise ValueError("No JSON array found in response")

    try:
        return json.loads(clean_text[start : end + 1])
    except json.JSONDecodeError as e:
        print(f"\n[DEBUG] JSON Parse Error on text:\n{clean_text[start : end + 1]}\n")
        raise e


# ── Generator Functions ────────────────────────────────────────────────────────

def generate_forbidden_words_batch(count: int, existing_words: set) -> list:
    """
    Generate `count` new Arabic words with forbidden words.
    Avoids any word already in `existing_words`.
    Returns list of dicts: {word, lang, forbiddenWords}
    """
    avoid_str = ", ".join(list(existing_words)[:50]) if existing_words else "none yet"

    prompt = f"""You are helping create content for an Arabic party game called "Forbidden Words".

Generate exactly {count} unique Arabic words for this game.
Rules:
- Each word must be a common Arabic noun (object, animal, place, profession, concept, food, etc.)
- For each word, provide exactly 8-10 related FORBIDDEN words players cannot say
- All words and forbidden words must be in Arabic
- Do NOT repeat any of these already-used words: {avoid_str}
- Make the words diverse across different categories
- Keep it family-friendly

Return ONLY a valid JSON array, no explanation, no markdown:
[
  {{
    "word": "كرة",
    "lang": "ar",
    "forbiddenWords": ["ملعب", "لعب", "هدف", "رياضة", "دوري", "تسجيل", "فريق", "حكم"]
  }},
  ...
]"""

    print(f"  🤖  Asking Pollinations to generate {count} words...")
    raw = ask_pollinations(prompt)
    items = extract_json(raw)

    # Validate and normalise
    result = []
    for item in items:
        if not isinstance(item, dict):
            continue
        w = item.get("word", "").strip()
        fw = item.get("forbiddenWords", [])
        if w and isinstance(fw, list) and len(fw) >= 5 and w not in existing_words:
            result.append({
                "word": w,
                "lang": item.get("lang", "ar"),
                "forbiddenWords": [str(x).strip() for x in fw if x],
            })
    return result


def generate_prompts_batch(count: int, existing_texts: set) -> list:
    """
    Generate `count` bizarre Arabic+English prompt pairs.
    Returns list of dicts: {text (ar), textEn}
    """
    avoid_str = "; ".join(list(existing_texts)[:20]) if existing_texts else "none yet"

    prompt = f"""You are creating content for an Arabic party game called "What's Inside the Box?".
Players see a bizarre AI-generated image and must describe it creatively.

Generate exactly {count} unique, bizarre, surreal image concepts.
Each concept should merge two normal everyday objects/things in a weird, funny, or impossible way.

Rules:
- Make them truly weird and unexpected (NOT generic)
- Each must have an Arabic description AND a short English image-generation prompt
- English prompt must be under 15 words, specific enough to generate a surreal image
- Arabic must be clear and descriptive for Arabic speakers
- Do NOT repeat: {avoid_str}
- Keep family-friendly

Return ONLY a valid JSON array, no explanation, no markdown:
[
  {{
    "text": "تفاحة من الداخل عبارة عن مجرة مضيئة",
    "textEn": "apple sliced open revealing glowing galaxy inside, photorealistic"
  }},
  ...
]"""

    print(f"  🤖  Asking Pollinations to generate {count} image prompts...")
    raw = ask_pollinations(prompt)
    items = extract_json(raw)

    result = []
    for item in items:
        if not isinstance(item, dict):
            continue
        ar = item.get("text", "").strip()
        en = item.get("textEn", "").strip()
        if ar and en and ar not in existing_texts:
            result.append({"text": ar, "textEn": en})
    return result


# ── Convex HTTP API ────────────────────────────────────────────────────────────

def convex_mutation(mutation_path: str, args: dict) -> dict:
    """Call a Convex mutation via HTTP API."""
    url = f"{CONVEX_URL}/api/mutation"
    payload = {"path": mutation_path, "args": args}
    resp = requests.post(url, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()


def convex_query(query_path: str, args: dict = {}) -> dict:
    """Call a Convex query via HTTP API."""
    url = f"{CONVEX_URL}/api/query"
    payload = {"path": query_path, "args": args}
    resp = requests.post(url, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()


def get_existing_words() -> set:
    try:
        result_count = convex_query("words:getWordCount", {"lang": "ar"})
        count = result_count.get("value", 0)
        print(f"  📊  Existing words in DB: {count}")
        
        result_words = convex_query("words:getRecentWords", {"lang": "ar", "limit": 100})
        words_list = result_words.get("value", [])
        return set(words_list)
    except Exception as e:
        print(f"  ⚠️  Could not query words: {e}")
        return set()


def get_existing_prompts() -> set:
    try:
        result_count = convex_query("prompts:getPromptCount", {})
        count = result_count.get("value", 0)
        print(f"  📊  Existing prompts in DB: {count}")

        result_prompts = convex_query("prompts:getRecentPrompts", {"limit": 100})
        prompts_list = result_prompts.get("value", [])
        return set(prompts_list)
    except Exception as e:
        print(f"  ⚠️  Could not query prompts: {e}")
        return set()


# ── Main ───────────────────────────────────────────────────────────────────────

def seed_words(total: int, batch_size: int = 5):
    print(f"\n{'='*50}")
    print(f"📝  Generating {total} Forbidden Words entries")
    print(f"{'='*50}")

    existing = get_existing_words()
    generated_all = []
    newly_seen = set()

    remaining = total
    while remaining > 0:
        current_batch = min(batch_size, remaining)
        avoid = existing | newly_seen

        try:
            batch = generate_forbidden_words_batch(current_batch, avoid)
            if not batch:
                print("  ⚠️  Empty batch returned, retrying...")
                time.sleep(3)
                continue

            print(f"  ✅  Generated {len(batch)} words, pushing to Convex...")
            result = convex_mutation("words:bulkInsertWords", {"words": batch})
            value = result.get("value", {})
            print(f"      → Inserted: {value.get('inserted', '?')}, Skipped: {value.get('skipped', '?')}")

            for w in batch:
                newly_seen.add(w["word"])

            generated_all.extend(batch)
            remaining -= len(batch)

        except json.JSONDecodeError as e:
            print(f"  ❌  JSON parse error: {e}. Retrying in 10s...")
            time.sleep(10)
        except requests.RequestException as e:
            print(f"  ❌  Network error: {e}. Retrying in 30s...")
            time.sleep(30)
        except Exception as e:
            print(f"  ❌  Error: {e}. Retrying in 10s...")
            time.sleep(10)
        else:
            print("  ⏳  Waiting 10s to avoid rate limits...")
            time.sleep(10)  # Be nice to the free API

    print(f"\n✅  Done! Generated {len(generated_all)} words total.")
    return generated_all


def seed_prompts(total: int, batch_size: int = 5):
    print(f"\n{'='*50}")
    print(f"🖼️   Generating {total} Image Prompt pairs")
    print(f"{'='*50}")

    existing = get_existing_prompts()
    generated_all = []
    newly_seen = set()

    remaining = total
    while remaining > 0:
        current_batch = min(batch_size, remaining)
        avoid = existing | newly_seen

        try:
            batch = generate_prompts_batch(current_batch, avoid)
            if not batch:
                print("  ⚠️  Empty batch returned, retrying...")
                time.sleep(3)
                continue

            print(f"  ✅  Generated {len(batch)} prompts, pushing to Convex...")
            result = convex_mutation("prompts:bulkInsertPrompts", {"prompts": batch})
            value = result.get("value", {})
            print(f"      → Inserted: {value.get('inserted', '?')}, Skipped: {value.get('skipped', '?')}")

            for p in batch:
                newly_seen.add(p["text"])

            generated_all.extend(batch)
            remaining -= len(batch)

        except json.JSONDecodeError as e:
            print(f"  ❌  JSON parse error: {e}. Retrying in 10s...")
            time.sleep(10)
        except requests.RequestException as e:
            print(f"  ❌  Network error: {e}. Retrying in 30s...")
            time.sleep(30)
        except Exception as e:
            print(f"  ❌  Error: {e}. Retrying in 10s...")
            time.sleep(10)
        else:
            print("  ⏳  Waiting 10s to avoid rate limits...")
            time.sleep(10)

    print(f"\n✅  Done! Generated {len(generated_all)} prompts total.")
    return generated_all


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Seed Ultimate Party Games content via Pollinations AI"
    )
    parser.add_argument("--words", type=int, default=10,
                        help="Number of forbidden-words entries to generate (default: 10)")
    parser.add_argument("--prompts", type=int, default=10,
                        help="Number of image prompt pairs to generate (default: 10)")
    parser.add_argument("--skip-words", action="store_true", help="Skip word generation")
    parser.add_argument("--skip-prompts", action="store_true", help="Skip prompt generation")
    args = parser.parse_args()

    print("🎮  Ultimate Party Games — Content Seeder")
    print("🤖  Using Pollinations.ai Text API (free, no key needed)")
    print(f"🔗  Convex: {CONVEX_URL}")

    if not args.skip_words:
        seed_words(args.words)

    if not args.skip_prompts:
        seed_prompts(args.prompts)

    print("\n🎉  All done! Your Convex DB has been seeded.")
    print("💡  Run again anytime to add more content — duplicates are automatically skipped.")
