import mercadopago

valores_doacao = [
    {"id": "1", "title": "Doação R$ 1.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 1000},
    {"id": "2", "title": "Doação R$ 5.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 5000},
    {"id": "3", "title": "Doação R$ 10.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 10000},
    {"id": "4", "title": "Doação R$ 20.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 20000},
    {"id": "5", "title": "Doação R$ 50.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 50000},
    {"id": "6", "title": "Doação R$ 100.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 100000},
    {"id": "7", "title": "Doação R$ 200.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 200000},
]

def gerar_link_pagamento():
    sdk = mercadopago.SDK("TEST-679603549375810-071623-f26c95b6d25a0bb29ffe7935a7d372ba-2566626888")
    payment_data = {
        "items": [valores_doacao[0]],
        "back_urls": {
            "success": "http://127.0.0.1:5000/sucesso",
            "pending": "http://127.0.0.1:5000/pendente",
            "failure": "http://127.0.0.1:5000/erro"
        },
        "auto_return": "all",
        "external_reference": "teste123",
        "statement_descriptor": "DOACAO CASA"
    }
    result = sdk.preference().create(payment_data)
    payment = result["response"]
    print("Resposta da API Mercado Pago:", payment)
    if "init_point" in payment:
        return payment["init_point"]
    else:
        print("Resposta inesperada da API:", payment)
        raise Exception("Não foi possível gerar o link de pagamento. Verifique as credenciais e os dados enviados.")

print(gerar_link_pagamento())