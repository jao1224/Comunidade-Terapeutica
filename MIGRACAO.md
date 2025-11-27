# 🔄 Migração Completa: Mercado Pago → Getnet

## ✅ Arquivos Criados

1. **apigetnet.py** - Cliente completo da API Getnet com exemplos comentados
2. **static/js/getnet-config.js** - Configuração JavaScript para Getnet
3. **README-GETNET.md** - Documentação completa da integração
4. **.env.example** - Template de configuração
5. **.gitignore** - Atualizado para incluir .env

## ✅ Arquivos Modificados

1. **app.py** - Substituído SDK do Mercado Pago por cliente Getnet
   - Novos endpoints: `/api/process-pix`, `/api/process-credit-card`, `/api/process-boleto`
   - Endpoint de status: `/api/payment-status/<payment_id>`
   - Endpoint de tokenização: `/api/tokenize-card`

2. **static/js/script.js** - Atualizado para usar Getnet
   - `MercadoPagoIntegration` → `GetnetIntegration`
   - Funções de pagamento adaptadas para API Getnet
   - Processamento de PIX, cartão e boleto

3. **index.html** - Atualizado referências
   - `mercadopago-config.js` → `getnet-config.js`
   - "Cartão/Mercado Pago" → "Cartão/Getnet"

4. **templates/index.html** - Atualizado referências
   - `mercadopago-config.js` → `getnet-config.js`
   - "Cartão/Mercado Pago" → "Cartão/Getnet"

5. **requirements.txt** - Removido `mercadopago`

6. **README.md** - Atualizado com informações da Getnet

## ❌ Arquivos Removidos

1. **apimercadopago.py** - Cliente do Mercado Pago
2. **README-MERCADOPAGO.md** - Documentação do Mercado Pago
3. **static/js/mercadopago-config.js** - Configuração do Mercado Pago
4. **exemplo_uso_getnet.py** - Arquivo de exemplo (conforme solicitado)
5. **exemplo_frontend.html** - Arquivo de exemplo (conforme solicitado)

## 🔑 Principais Diferenças

### Autenticação
- **Mercado Pago**: Access Token direto
- **Getnet**: OAuth 2.0 (Client ID + Client Secret)

### Valores
- **Mercado Pago**: Valores em reais (ex: 100.00)
- **Getnet**: Valores em centavos (ex: 10000 = R$ 100,00)

### Estrutura de Dados
- **Mercado Pago**: `payer`, `items`, `back_urls`
- **Getnet**: `customer`, `order`, `credit/boleto/pix`

### Endpoints
- **Mercado Pago**: `/api/create-preference`, `/api/process-pix`
- **Getnet**: `/api/process-pix`, `/api/process-credit-card`, `/api/process-boleto`

## 📋 Próximos Passos

1. **Obter Credenciais**
   - Acesse: https://developers.getnet.com.br/
   - Crie uma conta ou faça login
   - Copie: SELLER_ID, CLIENT_ID, CLIENT_SECRET

2. **Configurar Ambiente**
   ```bash
   cp .env.example .env
   # Edite .env com suas credenciais
   ```

3. **Instalar Dependências**
   ```bash
   pip install -r requirements.txt
   ```

4. **Testar em Sandbox**
   ```bash
   python app.py
   ```
   - Use cartões de teste
   - Teste PIX, cartão e boleto

5. **Migrar para Produção**
   - Altere `GETNET_ENVIRONMENT=production`
   - Use credenciais de produção
   - Configure HTTPS
   - Implemente webhooks

## 🧪 Testando

### PIX
```javascript
const getnet = new GetnetIntegration();
const result = await getnet.processPixPayment(100.00, {
    email: 'teste@example.com',
    first_name: 'João',
    last_name: 'Silva',
    document_number: '12345678900'
});
```

### Cartão de Crédito
Use o cartão de teste: `5155901222280001`

### Boleto
Gere um boleto com vencimento em 3 dias

## 📞 Suporte

- **Getnet**: https://developers.getnet.com.br/suporte
- **Documentação**: Veja README-GETNET.md
- **Exemplos**: Veja comentários em apigetnet.py

---

**Migração concluída com sucesso! ✅**
