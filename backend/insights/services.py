import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from googletrans import Translator
from joblib import load

nltk.download('vader_lexicon')
sia = SentimentIntensityAnalyzer()
translator = Translator()

# Load ML model
try:
    model = load('insights/sentiment_model.pkl')
    use_ml_model = True
except:
    model = None
    use_ml_model = False

def translate_text(text):
    try:
        translated = translator.translate(text, src='si', dest='en')
        return translated.text
    except:
        return text

def analyze_text(text, method='nltk'):
    translated = translate_text(text)

    if method == 'ml' and use_ml_model:
        label = model.predict([translated])[0]
        return {
            "original": text,
            "translated": translated,
            "label": label
        }

    score = sia.polarity_scores(translated)
    label = 'positive' if score['compound'] > 0.2 else 'negative' if score['compound'] < -0.2 else 'neutral'

    return {
        "original": text,
        "translated": translated,
        "label": label,
        "score": score
    }

def is_respectful(text):
    rude_keywords = ['idiot', 'stupid', 'dumb', 'hate', 'ugly', 'fool', 'nonsense']
    return not any(word in text.lower() for word in rude_keywords)

def mentions_location(text):
    location_keywords = ['colombo', 'kandy', 'galle', 'address', 'home', 'my place', 'city']
    return any(loc in text.lower() for loc in location_keywords)
