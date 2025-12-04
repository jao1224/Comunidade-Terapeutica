// Polyfill para Promise (celulares antigos)
if (typeof Promise === 'undefined') {
    window.Promise = function(executor) {
        var callbacks = [];
        var errorCallbacks = [];
        var resolved = false;
        var rejected = false;
        var value;
        
        function resolve(val) {
            if (resolved || rejected) return;
            resolved = true;
            value = val;
            callbacks.forEach(function(cb) { cb(val); });
        }
        
        function reject(err) {
            if (resolved || rejected) return;
            rejected = true;
            value = err;
            errorCallbacks.forEach(function(cb) { cb(err); });
        }
        
        this.then = function(onResolve, onReject) {
            if (resolved) {
                onResolve && onResolve(value);
            } else if (rejected) {
                onReject && onReject(value);
            } else {
                onResolve && callbacks.push(onResolve);
                onReject && errorCallbacks.push(onReject);
            }
            return this;
        };
        
        this.catch = function(onReject) {
            return this.then(null, onReject);
        };
        
        try {
            executor(resolve, reject);
        } catch (e) {
            reject(e);
        }
    };
}

// Configuração da Getnet
var GETNET_CONFIG = {
    // Ambiente: 'sandbox' ou 'production'
    environment: 'production',
    
    // URL da API
    apiUrl: window.location.origin,
    
    // Configurações do pagamento
    currency: 'BRL',
    description: 'Doação para Passo a Passo Comunidade Terapêutica'
};

// Funções para integração com Getnet
class GetnetIntegration {
    constructor() {
        this.config = GETNET_CONFIG;
    }
    

    // Criar link de pagamento (Plataforma Digital)
    createPaymentLink(valor, description) {
        var self = this;
        description = description || null;
        
        console.log('createPaymentLink chamado com:', { valor: valor, description: description });
        
        return new Promise(function(resolve, reject) {
            try {
                var url = self.config.apiUrl + '/api/create-payment-link';
                var payload = {
                    amount: valor,
                    description: description || self.config.description
                };
                
                console.log('Enviando requisição para:', url);
                console.log('Payload:', payload);
                
                // Verificar se fetch está disponível
                if (typeof fetch === 'undefined') {
                    // Fallback para XMLHttpRequest (celulares antigos)
                    var xhr = new XMLHttpRequest();
                    xhr.open('POST', url, true);
                    xhr.setRequestHeader('Content-Type', 'application/json');
                    
                    xhr.onload = function() {
                        console.log('Status da resposta:', xhr.status);
                        console.log('Resposta (texto):', xhr.responseText);
                        
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                var result = JSON.parse(xhr.responseText);
                                console.log('Resultado:', result);
                                resolve(result);
                            } catch (e) {
                                reject(new Error('Erro ao processar resposta'));
                            }
                        } else {
                            try {
                                var error = JSON.parse(xhr.responseText);
                                reject(new Error(error.error || 'Erro ao criar link de pagamento'));
                            } catch (e) {
                                reject(new Error('Erro ao criar link de pagamento'));
                            }
                        }
                    };
                    
                    xhr.onerror = function() {
                        reject(new Error('Erro de conexão'));
                    };
                    
                    xhr.send(JSON.stringify(payload));
                    return;
                }
                
                // Usar fetch para navegadores modernos
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                })
                .then(function(response) {
                    console.log('Status da resposta:', response.status);
                    
                    return response.text().then(function(responseText) {
                        console.log('Resposta (texto):', responseText);
                        
                        if (!response.ok) {
                            var error;
                            try {
                                error = JSON.parse(responseText);
                            } catch (e) {
                                error = { error: responseText };
                            }
                            throw new Error(error.error || 'Erro ao criar link de pagamento');
                        }
                        
                        var result = JSON.parse(responseText);
                        console.log('Resultado:', result);
                        return result;
                    });
                })
                .then(function(result) {
                    resolve(result);
                })
                .catch(function(error) {
                    console.error('Erro ao criar link de pagamento:', error);
                    reject(error);
                });
                
            } catch (error) {
                console.error('Erro ao criar link de pagamento:', error);
                reject(error);
            }
        });
    }
    
    // Processar pagamento PIX
    async processPixPayment(valor, payerData) {
        try {
            const response = await fetch(`${this.config.apiUrl}/api/process-pix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    transaction_amount: valor,
                    description: this.config.description,
                    payer: {
                        email: payerData.email || 'contato@example.com',
                        first_name: payerData.first_name || 'Doador',
                        last_name: payerData.last_name || 'Anônimo',
                        document_number: payerData.document_number || '00000000000'
                    }
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao processar pagamento PIX');
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Erro ao processar PIX:', error);
            throw error;
        }
    }
    
    // Processar pagamento com cartão de crédito
    async processCreditCardPayment(paymentData) {
        try {
            const response = await fetch(`${this.config.apiUrl}/api/process-credit-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao processar pagamento com cartão');
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Erro ao processar cartão:', error);
            throw error;
        }
    }
    
    // Processar pagamento com boleto
    async processBoletoPayment(paymentData) {
        try {
            const response = await fetch(`${this.config.apiUrl}/api/process-boleto`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao processar boleto');
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Erro ao processar boleto:', error);
            throw error;
        }
    }
    
    // Tokenizar cartão
    async tokenizeCard(cardData) {
        try {
            const response = await fetch(`${this.config.apiUrl}/api/tokenize-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    card_number: cardData.number,
                    customer_id: cardData.customer_id,
                    expiration_month: cardData.expiration_month,
                    expiration_year: cardData.expiration_year,
                    security_code: cardData.security_code,
                    cardholder_name: cardData.cardholder_name
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao tokenizar cartão');
            }
            
            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Erro ao tokenizar cartão:', error);
            throw error;
        }
    }
    
    // Verificar status do pagamento
    async checkPaymentStatus(paymentId) {
        try {
            const response = await fetch(`${this.config.apiUrl}/api/payment-status/${paymentId}`);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao verificar status do pagamento');
            }
            
            const status = await response.json();
            return status;
            
        } catch (error) {
            console.error('Erro ao verificar status:', error);
            throw error;
        }
    }
    
    // Exibir QR Code PIX
    displayPixQRCode(qrCodeData, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container não encontrado:', containerId);
            return;
        }
        
        container.innerHTML = `
            <div class="pix-qrcode-container">
                <h3>Pague com PIX</h3>
                ${qrCodeData.qr_code_base64 ? 
                    `<img src="data:image/png;base64,${qrCodeData.qr_code_base64}" alt="QR Code PIX" class="qr-code-image" />` :
                    qrCodeData.qr_code_url ? 
                    `<img src="${qrCodeData.qr_code_url}" alt="QR Code PIX" class="qr-code-image" />` :
                    '<p>QR Code não disponível</p>'
                }
                <div class="pix-code">
                    <p>Ou copie o código PIX:</p>
                    <input type="text" value="${qrCodeData.qr_code || ''}" readonly class="pix-code-input" id="pixCode" />
                    <button onclick="copyPixCode()" class="copy-button">Copiar Código</button>
                </div>
                <p class="pix-instructions">
                    1. Abra o app do seu banco<br>
                    2. Escolha pagar com PIX<br>
                    3. Escaneie o QR Code ou cole o código
                </p>
            </div>
        `;
    }
    
    // Validar número de cartão (algoritmo de Luhn)
    validateCardNumber(cardNumber) {
        const digits = cardNumber.replace(/\D/g, '');
        let sum = 0;
        let isEven = false;
        
        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }
    
    // Validar CPF
    validateCPF(cpf) {
        cpf = cpf.replace(/\D/g, '');
        
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
            return false;
        }
        
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            sum += parseInt(cpf[i]) * (10 - i);
        }
        let digit = 11 - (sum % 11);
        if (digit >= 10) digit = 0;
        if (digit !== parseInt(cpf[9])) return false;
        
        sum = 0;
        for (let i = 0; i < 10; i++) {
            sum += parseInt(cpf[i]) * (11 - i);
        }
        digit = 11 - (sum % 11);
        if (digit >= 10) digit = 0;
        if (digit !== parseInt(cpf[10])) return false;
        
        return true;
    }
    
    // Formatar valor em reais
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    }
}

// Função auxiliar para copiar código PIX
function copyPixCode() {
    const pixCodeInput = document.getElementById('pixCode');
    if (pixCodeInput) {
        pixCodeInput.select();
        document.execCommand('copy');
        alert('Código PIX copiado!');
    }
}

// Exportar para uso global
window.GetnetIntegration = GetnetIntegration;
