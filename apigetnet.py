import requests
import json
from datetime import datetime

class GetnetAPI:
    """
    Cliente para integração com a API da Getnet
    Documentação: https://developers.getnet.com.br/
    """
    
    def __init__(self, seller_id, client_id, client_secret, environment='sandbox'):
        """
        Inicializa o cliente da Getnet
        
        Args:
            seller_id: ID do vendedor na Getnet
            client_id: Client ID para autenticação OAuth
            client_secret: Client Secret para autenticação OAuth
            environment: 'sandbox' ou 'production'
        """
        self.seller_id = seller_id
        self.client_id = client_id
        self.client_secret = client_secret
        
        if environment == 'sandbox':
            self.base_url = 'https://api-sandbox.getnet.com.br'
        else:
            self.base_url = 'https://api.getnet.com.br'
        
        self.access_token = None
    
    def authenticate(self):
        """Obtém token de acesso OAuth"""
        url = f"{self.base_url}/auth/oauth/v2/token"
        
        headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': f'Basic {self._get_basic_auth()}'
        }
        
        data = {
            'scope': 'oob',
            'grant_type': 'client_credentials'
        }
        
        print(f"\n=== AUTENTICANDO ===")
        print(f"URL: {url}")
        print(f"Client ID: {self.client_id}")
        
        response = requests.post(url, headers=headers, data=data)
        
        print(f"Status: {response.status_code}")
        print(f"Resposta: {response.text[:200]}")
        print(f"====================\n")
        
        if response.status_code == 200:
            result = response.json()
            self.access_token = result['access_token']
            print(f"✅ Token obtido com sucesso!")
            return self.access_token
        else:
            raise Exception(f"Erro na autenticação: {response.status_code} - {response.text}")
    
    def _get_basic_auth(self):
        """Gera o token Basic Auth"""
        import base64
        credentials = f"{self.client_id}:{self.client_secret}"
        return base64.b64encode(credentials.encode()).decode()
    
    def _get_headers(self):
        """Retorna headers padrão para requisições"""
        if not self.access_token:
            self.authenticate()
        
        return {
            'Authorization': f'Bearer {self.access_token}',
            'Content-Type': 'application/json',
            'seller_id': self.seller_id
        }
    
    def create_credit_card_payment(self, payment_data):
        """
        Cria um pagamento com cartão de crédito
        
        Args:
            payment_data: Dicionário com dados do pagamento
        """
        url = f"{self.base_url}/v1/payments/credit"
        
        response = requests.post(
            url,
            headers=self._get_headers(),
            json=payment_data
        )
        
        return response.json()
    
    def create_debit_card_payment(self, payment_data):
        """Cria um pagamento com cartão de débito"""
        url = f"{self.base_url}/v1/payments/debit"
        
        response = requests.post(
            url,
            headers=self._get_headers(),
            json=payment_data
        )
        
        return response.json()
    
    def create_boleto_payment(self, payment_data):
        """Cria um pagamento com boleto"""
        url = f"{self.base_url}/v1/payments/boleto"
        
        response = requests.post(
            url,
            headers=self._get_headers(),
            json=payment_data
        )
        
        return response.json()
    
    def create_payment_link(self, amount, description, redirect_urls=None):
        """
        Cria um link de pagamento usando a Plataforma Digital da Getnet
        Documentação: https://developers.getnet.com.br/products-docs/b07ilzfwy21roh8ui801cvxz/
        
        Args:
            amount: Valor em centavos (ex: 10000 = R$ 100,00)
            description: Descrição do pagamento
            redirect_urls: URLs de redirecionamento (success, error)
        """
        # Endpoint correto da Plataforma Digital
        url = f"{self.base_url}/v1/mgm/payment-link"
        
        # Estrutura conforme documentação oficial da Getnet
        payment_data = {
            "label": description[:50],  # Máximo 50 caracteres
            "order": {
                "amount": amount,
                "title": description[:100]  # Máximo 100 caracteres
            },
            "payment": {
                "methods": ["CREDIT", "DEBIT", "PIX"]  # Removido BOLETO temporariamente
            }
        }
        
        # Não adicionar redirect_urls por enquanto para testar
        # if redirect_urls:
        #     payment_data["redirect_urls"] = {
        #         "success": redirect_urls.get("success"),
        #         "error": redirect_urls.get("error")
        #     }
        
        print(f"\n=== CRIANDO LINK DE PAGAMENTO ===")
        print(f"URL: {url}")
        print(f"Payload: {json.dumps(payment_data, indent=2)}")
        
        response = requests.post(
            url,
            headers=self._get_headers(),
            json=payment_data
        )
        
        print(f"Status: {response.status_code}")
        print(f"Resposta: {response.text}")
        print(f"=================================\n")
        
        if response.status_code not in [200, 201]:
            raise Exception(f"Erro ao criar link de pagamento: {response.status_code} - {response.text}")
        
        return response.json()
    

    
    def create_pix_payment(self, amount, order_id, customer_data):
        """
        Cria um pagamento PIX direto (QR Code)
        
        Args:
            amount: Valor em centavos (ex: 10000 = R$ 100,00)
            order_id: ID único do pedido
            customer_data: Dados do cliente
        """
        url = f"{self.base_url}/v1/payments/qrcode/pix"
        
        payment_data = {
            "seller_id": self.seller_id,
            "amount": amount,
            "currency": "BRL",
            "order": {
                "order_id": order_id,
                "sales_tax": 0,
                "product_type": "service"
            },
            "customer": customer_data
        }
        
        response = requests.post(
            url,
            headers=self._get_headers(),
            json=payment_data
        )
        
        if response.status_code not in [200, 201]:
            raise Exception(f"Erro ao criar pagamento PIX: {response.status_code} - {response.text}")
        
        return response.json()
    
    def get_payment_status(self, payment_id):
        """Consulta o status de um pagamento"""
        url = f"{self.base_url}/v1/payments/{payment_id}"
        
        response = requests.get(
            url,
            headers=self._get_headers()
        )
        
        return response.json()
    
    def cancel_payment(self, payment_id):
        """Cancela um pagamento"""
        url = f"{self.base_url}/v1/payments/cancel"
        
        data = {
            "payment_id": payment_id
        }
        
        response = requests.post(
            url,
            headers=self._get_headers(),
            json=data
        )
        
        return response.json()
    
    def tokenize_card(self, card_data):
        """
        Tokeniza um cartão de crédito
        
        Args:
            card_data: Dados do cartão
        """
        url = f"{self.base_url}/v1/tokens/card"
        
        response = requests.post(
            url,
            headers=self._get_headers(),
            json=card_data
        )
        
        return response.json()


# =========================
# EXEMPLOS DE USO
# =========================

"""
# 1. INICIALIZAR O CLIENTE
getnet = GetnetAPI(
    seller_id='SEU_SELLER_ID',
    client_id='SEU_CLIENT_ID',
    client_secret='SEU_CLIENT_SECRET',
    environment='sandbox'  # ou 'production'
)

# 2. CRIAR LINK DE PAGAMENTO (Plataforma Digital - Recomendado)
# Aceita PIX, Cartão de Crédito, Cartão de Débito e Boleto
link_result = getnet.create_payment_link(
    amount=100000,  # R$ 1.000,00 (valor em centavos)
    description='Doação para Passo a Passo',
    redirect_urls={
        "success": "https://seusite.com/sucesso",
        "error": "https://seusite.com/erro",
        "pending": "https://seusite.com/pendente"
    }
)
# Retorna: payment_link_id, link (URL do pagamento), qr_code

# 3. CRIAR PAGAMENTO PIX DIRETO (QR Code)
result = getnet.create_pix_payment(
    amount=100000,  # R$ 1.000,00 (valor em centavos)
    order_id='ORDER_123',
    customer_data={
        "customer_id": "customer_123",
        "first_name": "João",
        "last_name": "Silva",
        "name": "João Silva",
        "email": "joao@example.com",
        "document_type": "CPF",
        "document_number": "12345678900"
    }
)
# Retorna: payment_id, status, qrcode (text, image_base64, image_url)

# 4. TOKENIZAR CARTÃO
token_result = getnet.tokenize_card({
    "card_number": "5155901222280001",  # Cartão de teste
    "customer_id": "customer_123",
    "expiration_month": "12",
    "expiration_year": "2028",
    "security_code": "123",
    "cardholder_name": "JOAO SILVA"
})
# Retorna: number_token

# 5. CRIAR PAGAMENTO COM CARTÃO
payment_result = getnet.create_credit_card_payment({
    "seller_id": "SEU_SELLER_ID",
    "amount": 50000,  # R$ 500,00
    "currency": "BRL",
    "order": {
        "order_id": "ORDER_456",
        "sales_tax": 0,
        "product_type": "service"
    },
    "customer": {
        "customer_id": "customer_123",
        "first_name": "João",
        "last_name": "Silva",
        "name": "João Silva",
        "email": "joao@example.com",
        "document_type": "CPF",
        "document_number": "12345678900",
        "phone_number": "5511999999999"
    },
    "device": {
        "ip_address": "127.0.0.1"
    },
    "credit": {
        "delayed": False,
        "save_card_data": False,
        "transaction_type": "FULL",
        "number_installments": 1,
        "card": {
            "number_token": "token_do_cartao",
            "cardholder_name": "JOAO SILVA",
            "security_code": "123",
            "brand": "Mastercard"
        }
    }
})

# 6. CRIAR BOLETO
boleto_result = getnet.create_boleto_payment({
    "seller_id": "SEU_SELLER_ID",
    "amount": 25000,  # R$ 250,00
    "currency": "BRL",
    "order": {
        "order_id": "ORDER_789",
        "sales_tax": 0,
        "product_type": "service"
    },
    "customer": {
        "customer_id": "customer_123",
        "first_name": "João",
        "last_name": "Silva",
        "name": "João Silva",
        "email": "joao@example.com",
        "document_type": "CPF",
        "document_number": "12345678900"
    },
    "boleto": {
        "our_number": "ORDER_789",
        "document_number": "12345678900",
        "expiration_date": "31/12/2025",
        "instructions": "Doação para Passo a Passo",
        "provider": "santander"
    }
})

# 7. CONSULTAR STATUS DO PAGAMENTO
status = getnet.get_payment_status('payment_id_aqui')
# Retorna: payment_id, status, amount, etc.

# 8. CANCELAR PAGAMENTO
cancel_result = getnet.cancel_payment('payment_id_aqui')

# CARTÕES DE TESTE (SANDBOX):
# Aprovado: 5155901222280001
# Negado: 5155901222270002
# CVV: 123
# Validade: Qualquer data futura
"""
