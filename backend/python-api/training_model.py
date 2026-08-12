import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import pickle

print("Loading training data...")
df = pd.read_csv("training_data.csv")
df.dropna(inplace=True)
df["text"] = df["title"] + " " + df["description"]

X_train, X_test, y_train, y_test = train_test_split(
    df["text"], df["priority"], test_size=0.2, random_state=42
)

print("Training model...")
vectorizer = TfidfVectorizer(stop_words="english")
X_train_vec = vectorizer.fit_transform(X_train)
X_test_vec = vectorizer.transform(X_test)

model = MultinomialNB()
model.fit(X_train_vec, y_train)

predictions = model.predict(X_test_vec)
accuracy = accuracy_score(y_test, predictions)

print(f"\n✅ Model Accuracy: {accuracy * 100:.2f}%")
print("\n", classification_report(y_test, predictions))

pickle.dump(model, open("model.pkl", "wb"))
pickle.dump(vectorizer, open("vectorizer.pkl", "wb"))
print("✅ model.pkl and vectorizer.pkl saved!")