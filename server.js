const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Simular API do Mercado Pago (para testes)
app.post('/api/create-preference', (req, res) => {
    console.log('Criando preferência:', req.body);
    
    // Simular resposta do Mercado Pago
    const preference = {
        id: 'pref_' + Date.now(),
        items: req.body.items,
        back_urls: req.body.back_urls,
        auto_return: req.body.auto_return,
        external_reference: req.body.external_reference,
        notification_url: req.body.notification_url,
        statement_descriptor: req.body.statement_descriptor
    };
    
    res.json(preference);
});

app.post('/api/process-payment', (req, res) => {
    console.log('Processando pagamento:', req.body);
    
    // Simular processamento de pagamento
    const payment = {
        id: 'pay_' + Date.now(),
        status: 'approved',
        status_detail: 'accredited',
        transaction_amount: req.body.amount,
        payment_method_id: req.body.payment_method_id,
        installments: req.body.installments,
        description: req.body.description,
        payer: req.body.payer
    };
    
    res.json(payment);
});

app.post('/api/generate-pix/:preferenceId', (req, res) => {
    console.log('Gerando PIX para preferência:', req.params.preferenceId);
    
    // Simular geração de QR Code PIX
    const pixData = {
        qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        qr_code_text: `00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266141740005204000053039865405${req.body.amount.toFixed(2)}5802BR5913Passo a Passo6008Brasilia62070503***6304E2CA`,
        preference_id: req.params.preferenceId
    };
    
    res.json(pixData);
});

app.get('/api/payment-status/:paymentId', (req, res) => {
    console.log('Verificando status do pagamento:', req.params.paymentId);
    
    // Simular verificação de status
    const status = {
        id: req.params.paymentId,
        status: 'approved',
        status_detail: 'accredited',
        transaction_amount: 1000.00,
        payment_method_id: 'visa',
        installments: 1,
        description: 'Doação - Passo a Passo Comunidade Terapêutica'
    };
    
    res.json(status);
});

// Webhook para notificações
app.post('/webhook', (req, res) => {
    console.log('Webhook recebido:', req.body);
    
    // Processar notificação
    const { type, data } = req.body;
    
    if (type === 'payment') {
        console.log('Pagamento processado:', data);
        // Aqui você pode salvar no banco de dados
        // Enviar e-mail de confirmação
        // etc.
    }
    
    res.status(200).send('OK');
});

// Páginas de retorno
app.get('/success.html', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Pagamento Aprovado</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .success { color: #27ae60; }
                .btn { background: #9c27b0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1 class="success">Pagamento Aprovado!</h1>
            <p>Obrigado pela sua doação. Você receberá um e-mail de confirmação.</p>
            <a href="/" class="btn">Voltar ao site</a>
        </body>
        </html>
    `);
});

app.get('/failure.html', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Pagamento Recusado</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .error { color: #e74c3c; }
                .btn { background: #9c27b0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1 class="error">Pagamento Recusado</h1>
            <p>Houve um problema com o pagamento. Tente novamente.</p>
            <a href="/" class="btn">Voltar ao site</a>
        </body>
        </html>
    `);
});

app.get('/pending.html', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Pagamento Pendente</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                .warning { color: #f39c12; }
                .btn { background: #9c27b0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1 class="warning">Pagamento Pendente</h1>
            <p>Seu pagamento está sendo processado. Você receberá uma confirmação em breve.</p>
            <a href="/" class="btn">Voltar ao site</a>
        </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
    console.log('Este é um servidor de teste. Para produção, configure o Mercado Pago real.');
}); 