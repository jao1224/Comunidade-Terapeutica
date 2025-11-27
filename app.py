from flask import Flask, request, jsonify, render_template
import os
from datetime import datetime
from apigetnet import GetnetAPI

# =========================
# Configuração do Flask e Getnet
# =========================
app = Flask(__name__)

# Credenciais da Getnet
GETNET_SELLER_ID = os.getenv('GETNET_SELLER_ID', '6998b003-8800-4ed5-be11-eae8e7bd4f97')
GETNET_CLIENT_ID = os.getenv('GETNET_CLIENT_ID', 'cd0b9ad5-bb47-403f-9ada-2e23fea824ba')
GETNET_CLIENT_SECRET = os.getenv('GETNET_CLIENT_SECRET', 'KJdI1P83qx7pg1N5fKDzC5SqIWJpcp9s')
GETNET_ENVIRONMENT = os.getenv('GETNET_ENVIRONMENT', 'production')  # 'sandbox' ou 'production'

# Inicializa o cliente da Getnet
getnet = GetnetAPI(
    seller_id=GETNET_SELLER_ID,
    client_id=GETNET_CLIENT_ID,
    client_secret=GETNET_CLIENT_SECRET,
    environment=GETNET_ENVIRONMENT
)

# =========================
# Rotas para páginas principais
# =========================
@app.route('/')
def index():
    """Serve a página principal do site."""
    return render_template('index.html')

@app.route('/test')
def test():
    """Página de teste da API"""
    import os
    test_file = os.path.join(os.path.dirname(__file__), 'test_api.html')
    if os.path.exists(test_file):
        with open(test_file, 'r', encoding='utf-8') as f:
            return f.read()
    else:
        return "Arquivo test_api.html não encontrado", 404

@app.route('/sucesso')
def sucesso():
    return render_template('sucesso.html')

@app.route('/erro')
def erro():
    return render_template('erro.html')

@app.route('/pendente')
def pendente():
    return render_template('pendente.html')

@app.route('/pix/<payment_id>')
def pix_page(payment_id):
    """Página de pagamento PIX"""
    return render_template('pix.html', payment_id=payment_id)

# =========================
# Rotas de API
# =========================
@app.route('/api/process-pix', methods=['POST'])
def process_pix():
    """Processa pagamento via PIX usando Getnet"""
    try:
        data = request.json
        
        # Gera ID único para o pedido
        order_id = f'DOACAO_{datetime.now().strftime("%Y%m%d%H%M%S")}'
        
        # Converte valor para centavos
        amount = int(float(data.get("transaction_amount", 0)) * 100)
        
        # Dados do cliente
        payer = data.get("payer", {})
        customer_data = {
            "customer_id": payer.get("email", "").replace("@", "_").replace(".", "_"),
            "first_name": payer.get("first_name", "Doador"),
            "last_name": payer.get("last_name", "Anônimo"),
            "name": f"{payer.get('first_name', 'Doador')} {payer.get('last_name', 'Anônimo')}",
            "email": payer.get("email", "contato@example.com"),
            "document_type": "CPF",
            "document_number": payer.get("document_number", "00000000000")
        }
        
        # URL de callback para notificações
        callback_url = f"{request.url_root}api/webhook/getnet"
        
        # Cria pagamento PIX na Getnet
        result = getnet.create_pix_payment(
            amount=amount,
            order_id=order_id,
            customer_data=customer_data,
            callback_url=callback_url
        )
        
        # Retorna dados do PIX
        return jsonify({
            "id": result.get("payment_id"),
            "order_id": order_id,
            "status": result.get("status"),
            "qr_code_base64": result.get("qrcode", {}).get("image_base64"),
            "qr_code": result.get("qrcode", {}).get("text"),
            "qr_code_url": result.get("qrcode", {}).get("image_url"),
            "amount": amount / 100,
            "success_url": f"{request.url_root}sucesso",
            "error_url": f"{request.url_root}erro",
            "pending_url": f"{request.url_root}pendente"
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/process-credit-card', methods=['POST'])
def process_credit_card():
    """Processa pagamento com cartão de crédito"""
    try:
        data = request.json
        
        # Gera ID único para o pedido
        order_id = f'DOACAO_{datetime.now().strftime("%Y%m%d%H%M%S")}'
        
        # Converte valor para centavos
        amount = int(float(data.get("amount", 0)) * 100)
        
        payment_data = {
            "seller_id": GETNET_SELLER_ID,
            "amount": amount,
            "currency": "BRL",
            "order": {
                "order_id": order_id,
                "sales_tax": 0,
                "product_type": "service"
            },
            "customer": data.get("customer"),
            "device": {
                "ip_address": request.remote_addr
            },
            "credit": {
                "delayed": False,
                "save_card_data": False,
                "transaction_type": "FULL",
                "number_installments": data.get("installments", 1),
                "card": data.get("card")
            }
        }
        
        result = getnet.create_credit_card_payment(payment_data)
        
        return jsonify({
            "payment_id": result.get("payment_id"),
            "order_id": order_id,
            "status": result.get("status"),
            "amount": amount / 100
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/process-boleto', methods=['POST'])
def process_boleto():
    """Processa pagamento com boleto"""
    try:
        data = request.json
        
        # Gera ID único para o pedido
        order_id = f'DOACAO_{datetime.now().strftime("%Y%m%d%H%M%S")}'
        
        # Converte valor para centavos
        amount = int(float(data.get("amount", 0)) * 100)
        
        payment_data = {
            "seller_id": GETNET_SELLER_ID,
            "amount": amount,
            "currency": "BRL",
            "order": {
                "order_id": order_id,
                "sales_tax": 0,
                "product_type": "service"
            },
            "customer": data.get("customer"),
            "boleto": {
                "our_number": order_id,
                "document_number": data.get("customer", {}).get("document_number"),
                "expiration_date": data.get("expiration_date"),
                "instructions": "Doação para Passo a Passo Comunidade Terapêutica",
                "provider": "santander"
            }
        }
        
        result = getnet.create_boleto_payment(payment_data)
        
        return jsonify({
            "payment_id": result.get("payment_id"),
            "order_id": order_id,
            "status": result.get("status"),
            "boleto_url": result.get("boleto", {}).get("_links", [{}])[0].get("href"),
            "barcode": result.get("boleto", {}).get("barcode"),
            "amount": amount / 100
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/payment-status/<payment_id>', methods=['GET'])
def payment_status(payment_id):
    """Consulta status de um pagamento"""
    try:
        result = getnet.get_payment_status(payment_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/tokenize-card', methods=['POST'])
def tokenize_card():
    """Tokeniza um cartão de crédito"""
    try:
        data = request.json
        result = getnet.tokenize_card(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/create-preference', methods=['POST'])
def create_preference():
    """Endpoint de compatibilidade - redireciona para modal"""
    return jsonify({
        "error": "Este endpoint não é mais usado. Use o modal de pagamento.",
        "message": "Por favor, limpe o cache do navegador (Ctrl+Shift+Delete)"
    }), 410

@app.route('/api/create-payment-link', methods=['POST'])
def create_payment_link():
    """Cria um link de pagamento usando Plataforma Digital da Getnet"""
    try:
        data = request.json
        
        # Converte valor para centavos
        amount = int(float(data.get("amount", 0)) * 100)
        description = data.get("description", "Doação para Passo a Passo Comunidade Terapêutica")
        
        print(f"Criando link de pagamento: R$ {amount/100:.2f}")
        
        # URLs de redirecionamento
        redirect_urls = {
            "success": f"{request.url_root}sucesso",
            "error": f"{request.url_root}erro"
        }
        
        # Cria link de pagamento na Getnet
        result = getnet.create_payment_link(
            amount=amount,
            description=description,
            redirect_urls=redirect_urls
        )
        
        print(f"Link criado com sucesso: {result}")
        
        # A resposta da Getnet deve conter um link para pagamento
        payment_url = result.get("link") or result.get("payment_url") or result.get("url")
        
        if not payment_url:
            print(f"⚠️ Resposta da Getnet não contém URL de pagamento: {result}")
            # Usar PIX manual como fallback
            return jsonify({
                "error": "Link de pagamento não disponível",
                "use_manual_pix": True,
                "pix_key": "52.853.543/0001-55",
                "amount": amount / 100
            }), 400
        
        # Retorna o link de pagamento
        return jsonify({
            "payment_link_id": result.get("payment_link_id") or result.get("id"),
            "payment_url": payment_url,
            "qr_code": result.get("qr_code"),
            "amount": amount / 100
        })
        
    except Exception as e:
        print(f"Erro ao criar link: {e}")
        # Retornar PIX manual como fallback
        return jsonify({
            "error": str(e),
            "use_manual_pix": True,
            "pix_key": "52.853.543/0001-55",
            "amount": data.get("amount", 0)
        }), 500

@app.route('/api/webhook/getnet', methods=['POST'])
def webhook_getnet():
    """Recebe notificações de status de pagamento da Getnet"""
    try:
        data = request.json
        payment_id = data.get("payment_id")
        status = data.get("status")
        
        # Aqui você pode processar a notificação
        # Por exemplo: atualizar banco de dados, enviar email, etc.
        print(f"Webhook recebido - Payment ID: {payment_id}, Status: {status}")
        
        # Retorna 200 para confirmar recebimento
        return jsonify({"received": True}), 200
        
    except Exception as e:
        print(f"Erro no webhook: {e}")
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(port=5000, debug=True) 