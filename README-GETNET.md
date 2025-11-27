# Integração com Getnet

Este projeto foi migrado do Mercado Pago para a **Getnet**, uma das principais adquirentes do Brasil.

## 📋 Pré-requisitos

1. **Conta na Getnet**: Crie uma conta em [https://site.getnet.com.br/](https://site.getnet.com.br/)
2. **Credenciais de API**: Obtenha suas credenciais no portal de desenvolvedores

## 🔑 Obtendo Credenciais

### Ambiente Sandbox (Testes)

1. Acesse: [https://developers.getnet.com.br/](https://developers.getnet.com.br/)
2. Faça login ou crie uma conta
3. Vá em **"Credenciais"** no menu
4. Copie suas credenciais de sandbox:
   - `SELLER_ID`
   - `CLIENT_ID`
   - `CLIENT_SECRET`

### Ambiente de Produção

1. Entre em contato com o suporte da Getnet
2. Solicite suas credenciais de produção
3. Configure o ambiente como `production`

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
GETNET_SELLER_ID=seu_seller_id_aqui
GETNET_CLIENT_ID=seu_client_id_aqui
GETNET_CLIENT_SECRET=seu_client_secret_aqui
GETNET_ENVIRONMENT=sandbox
```

**Importante**: Para produção, altere `GETNET_ENVIRONMENT=production`

### 3. Atualizar app.py

Se não estiver usando `.env`, edite diretamente no `app.py`:

```python
GETNET_SELLER_ID = 'seu_seller_id'
GETNET_CLIENT_ID = 'seu_client_id'
GETNET_CLIENT_SECRET = 'seu_client_secret'
GETNET_ENVIRONMENT = 'sandbox'  # ou 'production'
```

## 🚀 Executando o Projeto

```bash
python app.py
```

O servidor estará disponível em: `http://localhost:5000`

## 💳 Métodos de Pagamento Suportados

### 1. PIX

```javascript
const getnet = new GetnetIntegration();

const pixData = await getnet.processPixPayment(100.00, {
    email: 'cliente@example.com',
    first_name: 'João',
    last_name: 'Silva',
    document_number: '12345678900'
});

// Exibir QR Code
getnet.displayPixQRCode(pixData, 'qrcode-container');
```

### 2. Cartão de Crédito

```javascript
const paymentData = {
    amount: 100.00,
    installments: 1,
    customer: {
        customer_id: 'customer_123',
        first_name: 'João',
        last_name: 'Silva',
        name: 'João Silva',
        email: 'joao@example.com',
        document_type: 'CPF',
        document_number: '12345678900',
        phone_number: '11999999999'
    },
    card: {
        number_token: 'token_do_cartao',
        cardholder_name: 'JOAO SILVA',
        security_code: '123',
        brand: 'Mastercard'
    }
};

const result = await getnet.processCreditCardPayment(paymentData);
```

### 3. Boleto

```javascript
const boletoData = {
    amount: 100.00,
    customer: {
        customer_id: 'customer_123',
        first_name: 'João',
        last_name: 'Silva',
        name: 'João Silva',
        email: 'joao@example.com',
        document_type: 'CPF',
        document_number: '12345678900'
    },
    expiration_date: '31/12/2025'
};

const result = await getnet.processBoletoPayment(boletoData);
```

## 🔄 Endpoints da API

### POST `/api/process-pix`
Cria um pagamento PIX

**Request:**
```json
{
    "transaction_amount": 100.00,
    "payer": {
        "email": "cliente@example.com",
        "first_name": "João",
        "last_name": "Silva",
        "document_number": "12345678900"
    }
}
```

**Response:**
```json
{
    "id": "payment_id",
    "order_id": "DOACAO_20250127120000",
    "status": "PENDING",
    "qr_code_base64": "base64_string",
    "qr_code": "pix_code_string",
    "amount": 100.00
}
```

### POST `/api/process-credit-card`
Processa pagamento com cartão de crédito

### POST `/api/process-boleto`
Gera um boleto bancário

### GET `/api/payment-status/<payment_id>`
Consulta o status de um pagamento

### POST `/api/tokenize-card`
Tokeniza um cartão de crédito

## 🧪 Testando com Dados de Sandbox

### Cartões de Teste

**Aprovado:**
- Número: `5155901222280001`
- CVV: `123`
- Validade: Qualquer data futura

**Negado:**
- Número: `5155901222270002`
- CVV: `123`
- Validade: Qualquer data futura

### CPF de Teste
- `12345678900`

## 📊 Status de Pagamento

| Status | Descrição |
|--------|-----------|
| `PENDING` | Pagamento pendente |
| `APPROVED` | Pagamento aprovado |
| `DENIED` | Pagamento negado |
| `CANCELED` | Pagamento cancelado |
| `ERROR` | Erro no processamento |

## 🔒 Segurança

- **Nunca** exponha suas credenciais no código
- Use variáveis de ambiente
- Em produção, use HTTPS
- Valide todos os dados do cliente
- Implemente rate limiting
- Use tokenização para cartões

## 📚 Documentação Oficial

- [Documentação Getnet](https://developers.getnet.com.br/)
- [API Reference](https://developers.getnet.com.br/api)
- [Guia de Integração](https://developers.getnet.com.br/guias)

## 🆘 Suporte

- Email: suporte@getnet.com.br
- Portal: [https://developers.getnet.com.br/suporte](https://developers.getnet.com.br/suporte)

## 📝 Diferenças do Mercado Pago

### Principais Mudanças:

1. **Autenticação**: Getnet usa OAuth 2.0
2. **Valores**: Getnet trabalha com centavos (100 = R$ 1,00)
3. **Estrutura de dados**: Formato diferente para customer e order
4. **Endpoints**: URLs e estruturas diferentes
5. **Tokenização**: Processo próprio da Getnet

### Migração:

- ✅ PIX: Totalmente suportado
- ✅ Cartão de Crédito: Suportado com tokenização
- ✅ Boleto: Suportado
- ✅ Consulta de status: Suportado
- ✅ Webhooks: Configurável no portal

## 🎯 Próximos Passos

1. Obter credenciais de sandbox
2. Testar pagamentos PIX
3. Testar cartão de crédito
4. Configurar webhooks
5. Migrar para produção

---

**Nota**: Este projeto foi migrado do Mercado Pago para Getnet. Certifique-se de atualizar todas as referências no frontend.
