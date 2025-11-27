# Passo a Passo Comunidade Terapêutica

## 🔄 Migração: Mercado Pago → Getnet

Este projeto foi **migrado da API do Mercado Pago para a Getnet**.

## 🚀 Características

- **Design Moderno**: Interface limpa e profissional com gradientes e animações suaves
- **Totalmente Responsivo**: Funciona perfeitamente em desktop, tablet e mobile
- **Integração Getnet**: Pagamentos via PIX, Cartão de Crédito e Boleto
- **Performance Otimizada**: Carregamento rápido e otimizado para SEO
- **Acessibilidade**: Navegação por teclado e leitores de tela

## 📁 Estrutura do Projeto

```
PROJETOCASADEAPOIO/
├── app.py                      # Aplicação Flask com endpoints Getnet
├── apigetnet.py                # Cliente da API Getnet
├── requirements.txt            # Dependências Python
├── .env.example                # Template de configuração
├── README-GETNET.md            # Documentação completa da Getnet
├── templates/
│   ├── index.html              # Página principal
│   ├── sucesso.html            # Página de sucesso
│   ├── erro.html               # Página de erro
│   └── pendente.html           # Página de pendente
└── static/
    ├── css/
    │   └── style.css           # Estilos CSS
    ├── js/
    │   ├── getnet-config.js    # Configuração Getnet
    │   └── script.js           # Funcionalidades JavaScript
    └── images/                 # Imagens do site
```

## 🛠️ Tecnologias Utilizadas

- **Backend**: Flask (Python)
- **Pagamentos**: Getnet API
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Fontes**: Google Fonts

## ⚙️ Configuração

### 1. Instalar Dependências

```bash
pip install -r requirements.txt
```

### 2. Configurar Credenciais da Getnet

Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
GETNET_SELLER_ID=seu_seller_id
GETNET_CLIENT_ID=seu_client_id
GETNET_CLIENT_SECRET=seu_client_secret
GETNET_ENVIRONMENT=sandbox
```

**Obtenha suas credenciais em**: https://developers.getnet.com.br/

### 3. Executar o Projeto

```bash
python app.py
```

O servidor estará disponível em: `http://localhost:5000`

## 💳 Métodos de Pagamento

### PIX
- Geração de QR Code
- Código PIX para copiar
- Confirmação em tempo real

### Cartão de Crédito
- Tokenização segura
- Parcelamento
- Validação de dados

### Boleto Bancário
- Geração de boleto
- Código de barras
- Link para impressão

## 📚 Documentação

Para informações detalhadas sobre a integração com a Getnet, consulte:
- **[README-GETNET.md](README-GETNET.md)** - Documentação completa
- **[apigetnet.py](apigetnet.py)** - Exemplos de uso comentados

## 🔑 Endpoints da API

- `POST /api/process-pix` - Criar pagamento PIX
- `POST /api/process-credit-card` - Processar cartão de crédito
- `POST /api/process-boleto` - Gerar boleto
- `GET /api/payment-status/<payment_id>` - Consultar status
- `POST /api/tokenize-card` - Tokenizar cartão

## 🧪 Testando

### Cartões de Teste (Sandbox)

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

## 📝 Arquivos Removidos

Os seguintes arquivos do Mercado Pago foram removidos:
- ❌ `apimercadopago.py`
- ❌ `README-MERCADOPAGO.md`
- ❌ `static/js/mercadopago-config.js`
- ❌ `exemplo_uso_getnet.py`
- ❌ `exemplo_frontend.html`

## 📞 Informações de Contato

**Passo a Passo Comunidade Terapêutica**
- **Telefone**: xxxxxxx
- **E-mail**: xxxxxxx
- **Instagram**: @CT_PASSO_A_PASSO
- **CNPJ**: 52.853.543/0001-55

### Dados Bancários
- **Banco**: Santander
- **Agência**: 1007
- **Conta Corrente**: 13.001326-4
- **PIX**: 52.853.543/0001-55

## 🔒 Segurança

- Nunca exponha suas credenciais no código
- Use variáveis de ambiente (`.env`)
- Em produção, use HTTPS
- Implemente rate limiting
- Use tokenização para cartões

## 🆘 Suporte Getnet

- **Email**: suporte@getnet.com.br
- **Portal**: https://developers.getnet.com.br/suporte
- **Documentação**: https://developers.getnet.com.br/

---

**Desenvolvido com ❤️ para a Passo a Passo Comunidade Terapêutica**
