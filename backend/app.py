from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
import numpy as np
import requests
import os

# 1. OBJEK APP HARUS DIBUAT DI SINI (Sebelum @app.route digunakan)
app = Flask(__name__)
CORS(app) 

FALLBACK_KURS = 15000 

def get_realtime_kurs():
    try:
        url = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=IDR"
        response = requests.get(url, timeout=3)
        if response.status_code == 200:
            data = response.json()
            return float(data['rates']['IDR'])
    except Exception as e:
        print(f"⚠️ Gagal mengambil kurs real-time ({str(e)}).")
    return FALLBACK_KURS

# --- MEMUAT ASET ML SECARA GLOBAL ---
try:
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('scaler.pkl', 'rb') as f:
        scaler = pickle.load(f)
    with open('feature_columns.pkl', 'rb') as f:
        feature_columns = pickle.load(f)
    print("🎉 SUKSES: Semua aset model XGBoost berhasil dimuat!")
except FileNotFoundError:
    print("❌ ERROR: File model tidak ditemukan!")

# 2. SEKARANG BARU BOLEH MEMBUAT ROUTE API
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        current_kurs = get_realtime_kurs()
        
        # Parsing data input
        lead_time = int(data.get('leadTime') if data.get('leadTime') else 0)
        deposit_type = str(data.get('depositType', 'No Deposit'))
        market_segment = str(data.get('marketSegment', 'Online TA'))
        prev_cancels = int(data.get('previousCancellations') if data.get('previousCancellations') else 0)
        booking_changes = int(data.get('bookingChanges') if data.get('bookingChanges') else 0)
        special_requests = int(data.get('totalSpecialRequests') if data.get('totalSpecialRequests') else 0)
        weekend_nights = int(data.get('weekendNights') if data.get('weekendNights') else 0)
        week_nights = int(data.get('weekNights') if data.get('weekNights') else 0)
        adr_input_rupiah = float(data.get('adr') if data.get('adr') else 0.0)
        adr_converted_to_dataset = adr_input_rupiah / current_kurs

        # Pemrosesan ke model XGBoost
        mapped_data = {
            'lead_time': lead_time, 'deposit_type': deposit_type, 'market_segment': market_segment,
            'previous_cancellations': prev_cancels, 'booking_changes': booking_changes,
            'total_of_special_requests': special_requests, 'stays_in_weekend_nights': weekend_nights,
            'stays_in_week_nights': week_nights, 'adr': adr_converted_to_dataset
        }
        input_df = pd.DataFrame([mapped_data])
        input_encoded = pd.get_dummies(input_df, columns=['deposit_type', 'market_segment'])
        final_input = pd.DataFrame(0, index=[0], columns=feature_columns)
        for col in input_encoded.columns:
            if col in final_input.columns:
                final_input[col] = input_encoded[col]
        final_input_scaled = scaler.transform(final_input)
        
        probabilities = model.predict_proba(final_input_scaled)[0]
        cancel_probability = float(probabilities[1])

        # ================= SIMULASI SHAP VALUE (MATRIKS RESTRUKTURISASI) =================
        base_value = 0.35 
        total_efek = cancel_probability - base_value

        weights = {}
        weights["Lead Time"] = (lead_time - 30) * 0.002
        weights["Jenis Deposit"] = 0.35 if deposit_type == 'Non Refund' else -0.05
        weights["Track Record"] = prev_cancels * 0.25
        weights["Permintaan Khusus"] = special_requests * -0.08
        weights["Booking Changes"] = booking_changes * -0.05
        weights["Harga Kamar (ADR)"] = (adr_converted_to_dataset - 100) * 0.001

        sum_weights = sum(abs(v) for v in weights.values())
        if sum_weights == 0: sum_weights = 1
        
        reasons = []
        for fitur, bobot in weights.items():
            kontribusi_persen = (bobot / sum_weights) * total_efek * 100
            
            if abs(kontribusi_persen) >= 1.0:
                arah = "menaikkan risiko sebesar" if kontribusi_persen > 0 else "menurunkan risiko sebesar"
                reasons.append({
                    "feature": fitur,
                    "impact": f"{abs(kontribusi_persen):.1f}%",
                    "direction": arah,
                    "text": f"Fitur **{fitur}** {arah} **{abs(kontribusi_persen):.1f}%**"
                })

        reasons = sorted(reasons, key=lambda x: float(x["impact"].replace("%","")), reverse=True)

        return jsonify({
            'status': 'success',
            'probability': cancel_probability,
            'base_probability': base_value,
            'risk_level': 'Risiko Tinggi' if cancel_probability >= 0.50 else 'Risiko Rendah',
            'reasons_v2': reasons,
            'meta': {
                'kurs_used': current_kurs,
                'adr_in_usd': round(adr_converted_to_dataset, 2)
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

# 3. MENYALAKAN SERVER DI PORT 5000
# if __name__ == '__main__':
#     app.run(host='0.0.0.0', port=5000, debug=True)


if __name__ == '__main__':
    # Railway akan menyuntikkan PORT dinamis lewat environment variable.
    # Jika dijalankan di lokal (tidak ada env PORT), sistem otomatis pakai port 5000.
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
    