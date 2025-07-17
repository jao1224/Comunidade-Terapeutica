from flask import Flask, request, jsonify, render_template
import mercadopago
import os

# =========================
# Configuração do Flask e Mercado Pago
# =========================
app = Flask(__name__)

# Substitua pelo seu access_token do Mercado Pago
sdk = mercadopago.SDK("TEST-679603549375810-071623-f26c95b6d25a0bb29ffe7935a7d372ba-2566626888")

# =========================
# Rotas para páginas principais
# =========================
@app.route('/')
def index():
    """Serve a página principal do site."""
    return render_template('index.html')

@app.route('/sucesso')
def sucesso():
    return render_template('sucesso.html')

@app.route('/erro')
def erro():
    return render_template('erro.html')

@app.route('/pendente')
def pendente():
    return render_template('pendente.html')

# =========================
# Rotas de API
# =========================
@app.route('/api/create-preference', methods=['POST'])
def create_preference():
    data = request.json
    preference_response = sdk.preference().create(data)
    return jsonify(preference_response["response"])

@app.route('/api/process-pix', methods=['POST'])
def process_pix():
    data = request.json
    payment_data = {
        "transaction_amount": data.get("transaction_amount"),
        "description": data.get("description", "Doação via PIX"),
        "payment_method_id": "pix",
        "payer": {
            "email": data.get("payer", {}).get("email"),
            "first_name": data.get("payer", {}).get("first_name", ""),
            "last_name": data.get("payer", {}).get("last_name", "")
        }
    }
    result = sdk.payment().create(payment_data)
    payment = result["response"]
    pix_info = payment.get("point_of_interaction", {}).get("transaction_data", {})
    return jsonify({
        "id": payment.get("id"),
        "status": payment.get("status"),
        "qr_code_base64": pix_info.get("qr_code_base64"),
        "qr_code": pix_info.get("qr_code"),
        "ticket_url": pix_info.get("ticket_url")
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True) 