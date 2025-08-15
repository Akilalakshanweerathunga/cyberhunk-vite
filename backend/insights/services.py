import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from googletrans import Translator
from joblib import load
import emoji
import re

nltk.download('vader_lexicon')

sia = SentimentIntensityAnalyzer()
translator = Translator()

# Load ML model
try:
    model = load('../ml_modals/sentiment_model.pkl')
    use_ml_model = True
except:
    model = None
    use_ml_model = False

# Emoji sentiment mapping
EMOJI_SENTIMENT = {
    "😀": "positive", "😃": "positive", "😄": "positive", "😁": "positive",
    "😆": "positive", "😊": "positive", "🙂": "positive", "😍": "positive",
    "🤩": "positive",
    "😢": "negative", "😞": "negative", "😠": "negative", "😡": "negative",
    "😔": "negative", "😭": "negative", "😖": "negative", "😣": "negative",
    "😐": "neutral", "😶": "neutral",
}

def translate_text(text):
    try:
        translated = translator.translate(text, src='si', dest='en')
        return translated.text
    except:
        return text

def extract_emojis(text):
    return [char for char in text if char in emoji.EMOJI_DATA]

def analyze_text(text, method='nltk'):
    if not text:
        return {
            "original": "",
            "translated": "",
            "label": "neutral",
            "emojis": [],
            "emoji_sentiments": []
        }

    translated = translate_text(text)

    if method == 'ml' and use_ml_model:
        try:
            label = model.predict([translated])[0]
        except:
            label = "neutral"
        score = None
    else:
        score = sia.polarity_scores(translated)
        label = 'positive' if score['compound'] > 0.2 else 'negative' if score['compound'] < -0.2 else 'neutral'

    emojis = extract_emojis(text)
    emoji_labels = [EMOJI_SENTIMENT.get(e, "neutral") for e in emojis]

    if emoji_labels:
        if emoji_labels.count("positive") > emoji_labels.count("negative"):
            label = "positive"
        elif emoji_labels.count("negative") > emoji_labels.count("positive"):
            label = "negative"
        else:
            label = "neutral"

    result = {
        "original": text,
        "translated": translated,
        "label": label,
        "emojis": emojis,
        "emoji_sentiments": emoji_labels
    }

    if score:
        result["score"] = score

    return result

def is_respectful(text):
    rude_keywords = ['idiot', 'stupid', 'dumb', 'hate', 'ugly', 'fool', 'nonsense']
    return not any(word in text.lower() for word in rude_keywords)

def mentions_location(text):
    location_keywords = ['colombo', 'kandy', 'galle', 'address', 'home', 'my place', 'city']
    return any(loc in text.lower() for loc in location_keywords)

def discloses_personal_info(text):
    patterns = [
        r"\b\d{10}\b",  # phone numbers
        r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}",  # email
        r"\b\d{1,4}\s\w+(\s\w+){0,3}",  # simple address
        r"(colombo|kandy|galle|my place|home|address|city)"  # locations
    ]
    return any(re.search(p, text, re.IGNORECASE) for p in patterns)

TOXIC_KEYWORDS = ['idiot', 'stupid', 'hate', 'fool', 'nonsense', 'loser', 'dumb', 'kill']
def is_toxic(text):
    return any(word in text.lower() for word in TOXIC_KEYWORDS)

MISINFO_KEYWORDS = ['breaking', 'shocking', 'miracle', 'you won’t believe', 'secret', 'cure']
def is_potential_misinformation(text):
    return any(word in text.lower() for word in MISINFO_KEYWORDS)
