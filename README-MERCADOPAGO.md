# Integração com Mercado Pago - Passo a Passo Comunidade Terapêutica

## Configuração Inicial

### 1. Criar Conta no Mercado Pago

1. Acesse [mercadopago.com.br](https://www.mercadopago.com.br)
2. Clique em "Criar conta"
3. Preencha os dados da instituição
4. Verifique o e-mail
5. Complete o cadastro com dados bancários

### 2. Obter Credenciais

1. Acesse o [Painel de Desenvolvedores](https://www.mercadopago.com.br/developers)
2. Vá em "Suas integrações"
3. Crie uma nova aplicação
4. Copie as credenciais:
   - **Public Key** (chave pública)
   - **Access Token** (chave privada)

### 3. Configurar o Código

Edite o arquivo `js/mercadopago-config.js` e substitua:

```javascript
const MERCADO_PAGO_CONFIG = {
    // Substitua pela sua chave pública real
    publicKey: 'TEST-00000000-0000-0000-0000-000000000000',
    // ... resto da configuração
};
```

## Configuração do Backend

### Opção 1: Node.js/Express

Crie um arquivo `server.js`:

```javascript
const express = require('express');
const mercadopago = require('mercadopago');
const app = express();

// Configurar Mercado Pago
mercadopago.configure({
    access_token: 'SEU_ACCESS_TOKEN_AQUI'
});

app.use(express.json());
app.use(express.static('.'));

// Criar preferência de pagamento
app.post('/api/create-preference', async (req, res) => {
    try {
        const preference = {
            items: req.body.items,
            back_urls: req.body.back_urls,
            auto_return: req.body.auto_return,
            external_reference: req.body.external_reference,
            notification_url: req.body.notification_url,
            statement_descriptor: req.body.statement_descriptor
        };

        const response = await mercadopago.preferences.create(preference);
        res.json(response.body);
    } catch (error) {
        console.error('Erro ao criar preferência:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Processar pagamento
app.post('/api/process-payment', async (req, res) => {
    try {
        const payment_data = {
            transaction_amount: req.body.amount,
            token: req.body.token,
            description: req.body.description,
            installments: req.body.installments,
            payment_method_id: req.body.payment_method_id,
            payer: {
                email: req.body.payer.email,
                identification: {
                    type: req.body.identification_type,
                    number: req.body.identification_number
                }
            }
        };

        const response = await mercadopago.payment.save(payment_data);
        res.json(response.body);
    } catch (error) {
        console.error('Erro ao processar pagamento:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Gerar QR Code PIX
app.post('/api/generate-pix/:preferenceId', async (req, res) => {
    try {
        const preferenceId = req.params.preferenceId;
        const response = await mercadopago.payment_methods.get();
        
        // Gerar QR Code PIX
        const pixData = {
            qr_code: 'data:image/png;base64,...', // QR Code gerado
            qr_code_text: '00020126580014br.gov.bcb.pix...' // Código PIX
        };
        
        res.json(pixData);
    } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Verificar status do pagamento
app.get('/api/payment-status/:paymentId', async (req, res) => {
    try {
        const paymentId = req.params.paymentId;
        const response = await mercadopago.payment.get(paymentId);
        res.json(response.body);
    } catch (error) {
        console.error('Erro ao verificar status:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Webhook para notificações
app.post('/webhook', async (req, res) => {
    try {
        const { type, data } = req.body;
        
        if (type === 'payment') {
            const payment = await mercadopago.payment.get(data.id);
            console.log('Pagamento recebido:', payment.body);
            
            // Aqui você pode salvar no banco de dados
            // Enviar e-mail de confirmação
            // etc.
        }
        
        res.status(200).send('OK');
    } catch (error) {
        console.error('Erro no webhook:', error);
        res.status(500).send('Erro');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
```

### Opção 2: PHP

Crie um arquivo `api.php`:

```php
<?php
require_once 'vendor/autoload.php';

use MercadoPago\SDK;
use MercadoPago\Preference;
use MercadoPago\Payment;

// Configurar Mercado Pago
SDK::setAccessToken('SEU_ACCESS_TOKEN_AQUI');

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['REQUEST_URI'];

switch ($method) {
    case 'POST':
        if (strpos($path, '/api/create-preference') !== false) {
            $data = json_decode(file_get_contents('php://input'), true);
            
            $preference = new Preference();
            $preference->items = $data['items'];
            $preference->back_urls = $data['back_urls'];
            $preference->auto_return = $data['auto_return'];
            $preference->external_reference = $data['external_reference'];
            $preference->notification_url = $data['notification_url'];
            $preference->statement_descriptor = $data['statement_descriptor'];
            
            $preference->save();
            
            echo json_encode($preference);
        }
        break;
        
    case 'GET':
        if (strpos($path, '/api/payment-status/') !== false) {
            $paymentId = basename($path);
            $payment = Payment::find_by_id($paymentId);
            
            echo json_encode($payment);
        }
        break;
}
?>
```

## Instalação das Dependências

### Node.js
```bash
npm init -y
npm install express mercadopago cors
```

### PHP
```bash
composer require mercadopago/dx-php
```

## Configurações Importantes

### 1. URLs de Retorno

Configure as URLs de retorno no painel do Mercado Pago:
- **Sucesso**: `https://seudominio.com/success.html`
- **Falha**: `https://seudominio.com/failure.html`
- **Pendente**: `https://seudominio.com/pending.html`

### 2. Webhook

Configure a URL do webhook:
- **URL**: `https://seudominio.com/webhook`
- **Eventos**: `payment`

### 3. Ambiente de Teste vs Produção

- **Teste**: Use credenciais de teste
- **Produção**: Use credenciais de produção

## Páginas de Retorno

### success.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>Pagamento Aprovado</title>
</head>
<body>
    <h1>Pagamento Aprovado!</h1>
    <p>Obrigado pela sua doação. Você receberá um e-mail de confirmação.</p>
    <a href="/">Voltar ao site</a>
</body>
</html>
```

### failure.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>Pagamento Recusado</title>
</head>
<body>
    <h1>Pagamento Recusado</h1>
    <p>Houve um problema com o pagamento. Tente novamente.</p>
    <a href="/">Voltar ao site</a>
</body>
</html>
```

### pending.html
```html
<!DOCTYPE html>
<html>
<head>
    <title>Pagamento Pendente</title>
</head>
<body>
    <h1>Pagamento Pendente</h1>
    <p>Seu pagamento está sendo processado. Você receberá uma confirmação em breve.</p>
    <a href="/">Voltar ao site</a>
</body>
</html>
```

## Testes

### Cartões de Teste

Use estes cartões para testar:

- **Aprovado**: 4509 9535 6623 3704
- **Recusado**: 4000 0000 0000 0002
- **Pendente**: 4000 0000 0000 0127

### PIX de Teste

Para testar PIX, use o app do Mercado Pago em modo de teste.

## Segurança

1. **Nunca** exponha o Access Token no frontend
2. Use HTTPS em produção
3. Valide todos os dados de entrada
4. Implemente rate limiting
5. Monitore os logs de pagamento

## Suporte

- [Documentação Mercado Pago](https://www.mercadopago.com.br/developers)
- [API Reference](https://www.mercadopago.com.br/developers/reference)
- [Status da API](https://status.mercadopago.com.br)

## Próximos Passos

1. Configure as credenciais reais
2. Implemente o backend
3. Teste em ambiente de desenvolvimento
4. Configure o webhook
5. Teste em produção
6. Monitore os pagamentos 