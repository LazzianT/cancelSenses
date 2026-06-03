import pandas as pd
import numpy as np
import xgboost as xgb
import pickle
from sklearn.model_selection import train_test_split, StratifiedKFold, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report

print("=== 1. Memuat Data dari hotel_booking.csv ===")
# Membaca data asli
df = pd.read_csv('hotel_booking.csv')

# --- DATA CLEANING & PREPROCESSING (Sesuai Karakteristik Dataset) ---
# Mengatasi anomali harga kamar (ADR tidak boleh negatif)
df.loc[df['adr'] < 0, 'adr'] = df['adr'].median()
# Memastikan jumlah tamu dewasa valid
df = df[df['adults'] != 0]

# --- SELEKSI FITUR SINKRON DENGAN FORM REACT ---
# Ini adalah 9 variabel yang diinput oleh user di antarmuka frontend kemarin
features = [
    'lead_time', 
    'deposit_type', 
    'market_segment', 
    'previous_cancellations', 
    'booking_changes', 
    'total_of_special_requests', 
    'stays_in_weekend_nights', 
    'stays_in_week_nights',
    'adr'
]
target = 'is_canceled'

X = df[features]
y = df[target]

print("\n=== 2. Proses Encoding Variabel Kategorikal ===")
# Mengubah kolom teks (deposit_type & market_segment) menjadi angka (One-Hot Encoding)
X_encoded = pd.get_dummies(X, columns=['deposit_type', 'market_segment'], drop_first=False)

# Menyimpan urutan kolom hasil encoding agar API nantinya tidak kehilangan struktur matriks
feature_columns = X_encoded.columns.tolist()
with open('feature_columns.pkl', 'wb') as f:
    pickle.dump(feature_columns, f)

# Membagi dataset menjadi Data Train (80%) dan Data Test (20%) secara Stratified (Seimbang)
X_train, X_test, y_train, y_test = train_test_split(X_encoded, y, test_size=0.2, random_state=42, stratify=y)

print("\n=== 3. Penskalaan Fitur (Feature Scaling) ===")
# Standarisasi nilai numerik seperti ADR dan Lead Time agar rentang angkanya tidak membingungkan algoritma
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Simpan objek scaler untuk dipakai di API nanti
with open('scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)

print("\n=== 4. Pelatihan Model XGBoost Berbasis Optimasi F1-Score ===")
# Menggunakan bobot scale_pos_weight untuk menangani ketidakseimbangan kelas (imbalanced data)
classes_weights = y_train.value_counts()
ratio = classes_weights[0] / classes_weights[1]

xgb_model = xgb.XGBClassifier(
    random_state=42,
    eval_metric='logloss',
    scale_pos_weight=ratio # Menyeimbangkan sensitivitas deteksi cancel
)

# Hyperparameter Grid Setup untuk Grid Search
param_grid = {
    'max_depth': [4, 6],
    'learning_rate': [0.1, 0.2],
    'n_estimators': [100, 150]
}

# Cross Validation Stratified 3-Fold
cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)

# KUNCI UTAMA: scoring diatur fokus ke 'f1' untuk menekan False Negatives & False Positives secara seimbang
grid_search = GridSearchCV(xgb_model, param_grid, cv=cv, scoring='f1', n_jobs=-1)
grid_search.fit(X_train_scaled, y_train)

best_model = grid_search.best_estimator_
print(f"-> Konfigurasi Hyperparameters Terbaik: {grid_search.best_params_}")

print("\n=== 5. Evaluasi Kinerja Akurasi Model (Fokus F1-Score Kelas 1) ===")
y_pred = best_model.predict(X_test_scaled)
print(classification_report(y_test, y_pred))

# Menyimpan file model final yang sudah pintar
with open('model.pkl', 'wb') as f:
    pickle.dump(best_model, f)

print("\n🎉 HORE! Model Pintar (model.pkl) Berhasil Diekspor dengan Optimasi F1-Score!")