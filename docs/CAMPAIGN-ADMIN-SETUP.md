# Ativação da área de campanhas

A implementação mantém a administração desativada até que a proteção e o armazenamento sejam
configurados no Cloudflare.

## 1. R2

1. Ativar o R2 na conta Cloudflare, aceitando os termos apresentados pelo painel.
2. Criar o bucket privado chamado bs-veritas-campaigns.
3. Não habilitar domínio público no bucket. As imagens são entregues exclusivamente pelo Worker.

## 2. Cloudflare Access

1. Em Zero Trust, criar uma aplicação Self-hosted para bsveritas.com.br.
2. Proteger os caminhos /admin/campanhas* e /api/admin/campaign*.
3. Criar uma política Allow somente para os dois e-mails administrativos informados pelo
   responsável do site.
4. Não criar política pública ou Bypass.
5. Copiar o Application Audience (AUD) e o domínio da equipe
   (https://equipe.cloudflareaccess.com).

## 3. Configuração do Worker

Gravar os valores sem colocá-los no Git:

    pnpm exec wrangler secret put CAMPAIGN_ACCESS_AUD
    pnpm exec wrangler secret put CAMPAIGN_ACCESS_TEAM_DOMAIN

Depois de validar o Access, alterar CAMPAIGN_ADMIN_ENABLED para true, executar a suíte de testes e
fazer o deploy. A aplicação valida o JWT do Access no próprio Worker e falha de forma fechada quando
qualquer configuração está ausente.

## 4. Verificação antes da publicação

- acesso negado fora dos dois e-mails autorizados;
- upload de JPG, PNG e WebP de até 8 MB;
- peças verticais 2:3 e 4:5 exibidas por inteiro, sem recorte ou texto sobreposto;
- rascunho não aparece no site nem expõe a imagem pública;
- publicação e retirada do ar funcionam;
- datas de início e fim controlam a exibição;
- exclusão exige confirmação e remove a imagem;
- o carrossel público continua utilizável por toque, mouse e teclado.
