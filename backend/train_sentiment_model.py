import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.pipeline import make_pipeline
import joblib

# Load and clean dataset
data = pd.read_csv('sentiment_dataset.csv')
data = data.dropna(subset=['text', 'label'])     # Remove rows with NaN
data['text'] = data['text'].astype(str)          # Ensure all text is string

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    data['text'], data['label'], test_size=0.2, random_state=42
)

# Build model pipeline
model = make_pipeline(CountVectorizer(), MultinomialNB())
model.fit(X_train, y_train)

# Evaluate
print("Accuracy:", model.score(X_test, y_test))

# Save the model
joblib.dump(model, 'sentiment_model.pkl')
print("Model saved to sentiment_model.pkl")
