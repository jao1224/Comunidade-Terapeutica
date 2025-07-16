// Configuração do Mercado Pago
const MERCADO_PAGO_CONFIG = {
    // Substitua pela sua chave pública do Mercado Pago
    publicKey: 'TEST-00000000-0000-0000-0000-000000000000',
    
    // URL da API do Mercado Pago
    apiUrl: 'https://api.mercadopago.com',
    
    // Configurações do pagamento
    currency: 'BRL',
    description: 'Doação para Passo a Passo Comunidade Terapêutica'
};

// Funções para integração com Mercado Pago
class MercadoPagoIntegration {
    constructor() {
        this.config = MERCADO_PAGO_CONFIG;
        this.initializeMercadoPago();
    }
    
    // Inicializar Mercado Pago
    initializeMercadoPago() {
        // Carregar SDK do Mercado Pago
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.onload = () => {
            this.mp = new MercadoPago(this.config.publicKey);
            console.log('Mercado Pago SDK carregado com sucesso!');
        };
        document.head.appendChild(script);
    }
    
    // Criar preferência de pagamento
    async createPreference(valor, descricao = '') {
        try {
            const preference = {
                items: [
                    {
                        title: 'Doação - Passo a Passo Comunidade Terapêutica',
                        unit_price: valor,
                        quantity: 1,
                        description: descricao || this.config.description
                    }
                ],
                back_urls: {
                    success: window.location.origin + '/success.html',
                    failure: window.location.origin + '/failure.html',
                    pending: window.location.origin + '/pending.html'
                },
                auto_return: 'approved',
                external_reference: 'doacao_' + Date.now(),
                notification_url: window.location.origin + '/webhook',
                statement_descriptor: 'PASSO A PASSO'
            };
            
            const response = await fetch('/api/create-preference', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(preference)
            });
            
            if (!response.ok) {
                throw new Error('Erro ao criar preferência de pagamento');
            }
            
            const data = await response.json();
            return data.id;
            
        } catch (error) {
            console.error('Erro ao criar preferência:', error);
            throw error;
        }
    }
    
    // Processar pagamento com cartão
    async processCardPayment(paymentData) {
        try {
            const cardForm = this.mp.cardForm({
                form: {
                    id: "form-checkout",
                    cardNumber: {
                        id: "form-checkout__cardNumber",
                        placeholder: "Número do cartão",
                    },
                    expirationDate: {
                        id: "form-checkout__expirationDate",
                        placeholder: "MM/YY",
                    },
                    securityCode: {
                        id: "form-checkout__securityCode",
                        placeholder: "CVV",
                    },
                    cardholderName: {
                        id: "form-checkout__cardholderName",
                        placeholder: "Titular do cartão",
                    },
                },
                callbacks: {
                    onFormMounted: error => {
                        if (error) console.error("Form Mounted handling error: ", error);
                    },
                    onSubmit: event => {
                        event.preventDefault();
                        const {
                            paymentMethod,
                            issuer,
                            cardholderEmail: email,
                            amount,
                            token,
                            installments,
                            identificationNumber,
                            identificationType,
                        } = cardForm.getCardFormData();
                        
                        this.processPayment({
                            token,
                            issuer,
                            payment_method_id: paymentMethod,
                            installments,
                            identification_type: identificationType,
                            identification_number: identificationNumber,
                            amount: paymentData.amount
                        });
                    },
                    onBinChange: event => {
                        console.log("BIN change: ", event);
                    },
                    onError: error => {
                        console.error("Error: ", error);
                    }
                }
            });
            
        } catch (error) {
            console.error('Erro ao processar pagamento com cartão:', error);
            throw error;
        }
    }
    
    // Processar pagamento
    async processPayment(paymentData) {
        try {
            const response = await fetch('/api/process-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) {
                throw new Error('Erro ao processar pagamento');
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Erro ao processar pagamento:', error);
            throw error;
        }
    }
    
    // Gerar QR Code PIX
    async generatePixQR(valor, descricao = '') {
        try {
            const preferenceId = await this.createPreference(valor, descricao);
            
            const response = await fetch(`/api/generate-pix/${preferenceId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: valor,
                    description: descricao || this.config.description
                })
            });
            
            if (!response.ok) {
                throw new Error('Erro ao gerar QR Code PIX');
            }
            
            const pixData = await response.json();
            return pixData;
            
        } catch (error) {
            console.error('Erro ao gerar QR Code PIX:', error);
            throw error;
        }
    }
    
    // Verificar status do pagamento
    async checkPaymentStatus(paymentId) {
        try {
            const response = await fetch(`/api/payment-status/${paymentId}`);
            
            if (!response.ok) {
                throw new Error('Erro ao verificar status do pagamento');
            }
            
            const status = await response.json();
            return status;
            
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            throw error;
        }
    }
}

// Exportar para uso global
window.MercadoPagoIntegration = MercadoPagoIntegration; 