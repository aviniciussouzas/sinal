# SINAL.

> Ferramenta experimental de coordenação semanal para times de design distribuídos.

---

## O problema

Times de design criativos sofrem de um fenômeno silencioso: a **ocupação defensiva**.

Um designer informa que está esperando uma alteração, ou um job que ainda não chegou — mas já travou a agenda. O gestor não consegue alocar projetos extras. Os designers mais disponíveis acabam sobrecarregados porque nunca dizem não. Os demais ficam "lotados" com trabalho hipotético.

O resultado: ninguém ajuda ninguém. A gestão vira um jogo de adivinhação.

O SINAL. foi criado para resolver isso.

---

## A solução

Uma linguagem comum. Um protocolo mínimo. Uma pergunta toda segunda-feira:

**"Como está sua semana?"**

Cada designer responde em uma escala de 0 a 5 — não sobre o que pode chegar, mas sobre o que está sendo executado agora. Quem está nos níveis 0, 1 ou 2 se torna **parceiro da semana** — disponível para absorver projetos extras ou ajudar quem está sobrecarregado.

```
0 — livre        → parceiro da semana
1 — leve         → parceiro da semana
2 — equilíbrio   → parceiro da semana
3 — cheio        → agenda comprometida
4 — pesado       → sem espaço agora
5 — no limite    → sem espaço agora
```

---

## Mecânica

### Check-in semanal (segunda-feira)
Cada membro do time acessa a ferramenta e informa:
- Nível de capacidade (0–5)
- Projetos que está executando **agora** (não os que podem chegar)
- Se tem espaço para extras

### Edição única (até quarta-feira)
A realidade muda. Um projeto foi entregue. Uma demanda entrou. O sinal pode ser atualizado **uma única vez** até quarta-feira. Após isso, o sinal da semana está definido.

Esse limite existe por intenção: evita que a ferramenta vire termômetro de humor e garante que cada sinal tenha peso.

### Parceiro da semana
Os **2 designers com menor nível** entre os disponíveis (0–2) são identificados como parceiros da semana. São os primeiros a ser acionados para projetos extras ou para apoiar quem está sobrecarregado.

Se houver mais de 2 disponíveis, os demais ficam como **reserva** — visíveis no dashboard mas não convocados primeiro.

### Quando todos estão lotados
Se todos os check-ins da semana forem nível 3 ou acima, o dashboard exibe um alerta coletivo. Nenhum parceiro disponível significa que a semana precisa de negociação de prazos — não de pressão.

---

## Regras do sistema

**1. Demanda real > demanda hipotética**
O sinal reflete o que está sendo executado agora. O que pode chegar não entra no cálculo.

**2. Reserva ≠ bloqueio**
Estar no nível 3 não significa recusar tudo. Significa avaliar com cuidado. O sistema dá visibilidade, não dita decisões.

**3. Reorganização é permitida — até quarta**
Se chegou uma urgência real ou um projeto foi entregue, atualiza o sinal. É para isso que a edição existe.

**4. Sinalização > silêncio**
O mínimo esperado de cada membro toda semana é um sinal. Sem login, sem burocracia — só uma resposta honesta.

**5. Transparência coletiva**
Todos veem todos. Não há área restrita para gestores. A ferramenta é um espelho do time, não um painel de controle.

---

## Sobre o projeto

O SINAL. nasceu de uma pesquisa de comportamento dentro de um time de design que presta serviços para uma agência. Foi concebido, desenhado e desenvolvido como uma ferramenta experimental — parte de uma investigação maior sobre como transformar gestão criativa em algo mais participativo, transparente e humano.

**Este projeto está na interseção entre pesquisa de comportamento e direção criativa.** Não é só uma ferramenta de gestão — é uma hipótese sobre como times de design podem se auto-organizar com mais inteligência e menos atrito.

> *"A gestão não precisa ser uma força que pressiona de cima. Pode ser uma conversa que acontece naturalmente toda segunda."*

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Linguagem:** TypeScript
- **Estilo:** Tailwind CSS
- **Banco de dados:** Google Sheets (via Google Sheets API v4)
- **Deploy:** Vercel
- **Autenticação:** nenhuma — intencional

---

## Configuração

### Pré-requisitos
- Node.js 18+
- Conta Google (para o Sheets)
- Conta Vercel (para o deploy)

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/sinal.git
cd sinal
npm install
```

### 2. Configure o Google Cloud

#### 2.1 Criar projeto
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto: `sinal-design`
3. Ative a **Google Sheets API** e a **Google Drive API**
   - Menu lateral → APIs e serviços → Biblioteca → pesquise e ative cada uma

#### 2.2 Criar Service Account
1. APIs e serviços → Credenciais → Criar credenciais → Conta de serviço
2. Nome: `sinal-sheets`
3. Papel: `Editor`
4. Após criar: clique na conta → aba **Chaves** → Adicionar chave → JSON
5. Faça o download do arquivo `.json` — guarde com segurança, **nunca suba para o GitHub**

#### 2.3 Criar a planilha
1. Crie uma nova planilha em [sheets.google.com](https://sheets.google.com)
2. Nome: `SINAL — Radar de Disponibilidade`
3. Na linha 1, adicione os cabeçalhos exatamente assim:

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | nome | semana | nivel | clientes | extras | data | hora | parceiro | versao |

4. Compartilhe a planilha com o `client_email` do arquivo JSON baixado (permissão de **Editor**)
5. Copie o **ID da planilha** — é o trecho da URL entre `/d/` e `/edit`

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
GOOGLE_SHEETS_ID=cole_aqui_o_id_da_planilha

GOOGLE_CLIENT_EMAIL=cole_aqui_o_client_email_do_json

GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\nSUA_CHAVE_AQUI\n-----END RSA PRIVATE KEY-----\n"
```

> ⚠️ O `GOOGLE_PRIVATE_KEY` deve estar entre aspas duplas e com os `\n` preservados exatamente como estão no arquivo JSON.

### 4. Rode localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`

---

## Deploy na Vercel

### 1. Suba o projeto para o GitHub

```bash
git init
git add .
git commit -m "feat: SINAL. v1 — radar de disponibilidade semanal"
git remote add origin https://github.com/seu-usuario/sinal.git
git push -u origin main
```

### 2. Conecte na Vercel

1. Acesse [vercel.com](https://vercel.com) → New Project
2. Importe o repositório do GitHub
3. Em **Environment Variables**, adicione as três variáveis do `.env.local`
4. Deploy

> ✅ O `.env.local` nunca vai para o GitHub. As variáveis ficam seguras no painel da Vercel.

---

## Estrutura do projeto

```
sinal/
├── app/
│   ├── page.tsx                 # Formulário de check-in
│   ├── layout.tsx               # Layout global
│   ├── api/
│   │   ├── checkin/
│   │   │   └── route.ts         # POST — salva check-in na planilha
│   │   └── dados/
│   │       └── route.ts         # GET — lê dados da planilha
│   └── dashboard/
│       ├── page.tsx             # Dashboard da equipe
│       └── layout.tsx
├── lib/
│   └── sheets.ts                # Cliente Google Sheets
├── .env.local                   # Variáveis de ambiente (não sobe pro Git)
├── .gitignore
└── README.md
```

---

## Disclaimer

Esta é uma ferramenta de uso **voluntário** entre prestadores de serviço independentes.

Não constitui controle de jornada, registro de ponto ou reconhecimento de vínculo empregatício entre as partes envolvidas.

---

## Roadmap

- [x] **v1** — Check-in semanal, escala 0–5, parceiro da semana, edição única até quarta, dashboard coletivo, tema dark/light
- [ ] **v2** — Aba de membros cadastrados, visibilidade de ausentes, histórico de parceiros por pessoa
- [ ] **v3** — Notificação automática toda segunda (WhatsApp ou e-mail)
- [ ] **v4** — Backlog de projetos extras: gestor cadastra, parceiro se voluntaria

---

## Licença

MIT — use, adapte, melhore. Se virar produto, conta a história de onde veio.
