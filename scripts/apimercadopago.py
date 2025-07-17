valores_doacao = [
    {"id": "1", "title": "Doação R$ 1.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 1000},
    {"id": "2", "title": "Doação R$ 5.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 5000},
    {"id": "3", "title": "Doação R$ 10.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 10000},
    {"id": "4", "title": "Doação R$ 20.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 20000},
    {"id": "5", "title": "Doação R$ 50.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 50000},
    {"id": "6", "title": "Doação R$ 100.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 100000},
    {"id": "7", "title": "Doação R$ 200.000,00", "quantity": 1, "currency_id": "BRL", "unit_price": 200000},
]

import requests

if __name__ == "__main__":
    url = "http://127.0.0.1:5000/api/create-preference"
    payment_data = {
        "items": [valores_doacao[0]],  # Exemplo: envia o primeiro valor
        "back_urls": {
            "success": "http://127.0.0.1:5000/sucesso",
            "pending": "http://127.0.0.1:5000/pendente",
            "failure": "http://127.0.0.1:5000/erro"
        },
        "external_reference": "teste123",
        "statement_descriptor": "DOACAO CASA"
    }
    response = requests.post(url, json=payment_data)
    print("Status:", response.status_code)
    try:
        print("Resposta:", response.json())
    except Exception:
        print("Resposta:", response.text) 