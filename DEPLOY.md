# 🚀 Deploy na Vercel

## Pré-requisitos

1. Conta na Vercel: https://vercel.com/
2. Vercel CLI instalado (opcional)

## Opção 1: Deploy via Interface Web (Recomendado)

### Passo 1: Conectar Repositório

1. Acesse: https://vercel.com/new
2. Importe seu repositório do GitHub
3. Ou faça upload dos arquivos diretamente

### Passo 2: Configurar Variáveis de Ambiente

Na página de configuração do projeto, adicione as seguintes variáveis:

```
GETNET_SELLER_ID=seu_seller_id_aqui
GETNET_CLIENT_ID=seu_client_id_aqui
GETNET_CLIENT_SECRET=seu_client_secret_aqui
GETNET_ENVIRONMENT=production
```

### Passo 3: Deploy

1. Clique em "Deploy"
2. Aguarde o build
3. Seu site estará no ar!

## Opção 2: Deploy via CLI

### Instalar Vercel CLI

```bash
npm install -g vercel
```

### Login

```bash
vercel login
```

### Deploy

```bash
vercel
```

### Configurar Variáveis de Ambiente

```bash
vercel env add GETNET_SELLER_ID production
# Cole o valor quando solicitado

vercel env add GETNET_CLIENT_ID production
# Cole o valor quando solicitado

vercel env add GETNET_CLIENT_SECRET production
# Cole o valor quando solicitado

vercel env add GETNET_ENVIRONMENT production
# Digite: production
```

### Deploy em Produção

```bash
vercel --prod
```

## Verificar Deploy

Após o deploy, teste:

1. Acesse a URL fornecida pela Vercel
2. Clique em um valor de doação
3. Teste o pagamento PIX
4. Teste o pagamento com cartão

## Problemas Comuns

### Erro 500 ao criar pagamento

- Verifique se as variáveis de ambiente estão configuradas
- Confirme se o GetPay está ativado na Getnet
- Entre em contato com o suporte da Getnet

### Arquivos estáticos não carregam

- Verifique se a pasta `static/` está no repositório
- Confirme se o `vercel.json` está correto

### Erro de módulo não encontrado

- Verifique se `requirements.txt` está atualizado
- Confirme se todos os imports estão corretos

## URLs Importantes

- **Painel Vercel**: https://vercel.com/dashboard
- **Documentação**: https://vercel.com/docs
- **Suporte**: https://vercel.com/support

## Comandos Úteis

```bash
# Ver logs
vercel logs

# Listar deploys
vercel ls

# Remover projeto
vercel remove

# Ver variáveis de ambiente
vercel env ls
```

## Domínio Customizado

Para adicionar um domínio próprio:

1. Vá em Settings → Domains
2. Adicione seu domínio
3. Configure os DNS conforme instruções
4. Aguarde propagação (até 48h)

---

**Pronto!** Seu site está no ar! 🎉
