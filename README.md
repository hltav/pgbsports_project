<p align="center">
  <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">
  <b>RT Sports Manager</b> — a professional sports bankroll management platform, built with <a href="http://nestjs.com/" target="_blank">NestJS</a> for scalable and secure backend development.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@nestjs/core"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/package/@nestjs/core"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="License" /></a>
  <a href="https://www.npmjs.com/package/@nestjs/common"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master" alt="Coverage" /></a>
  <a href="https://discord.gg/nestjs" target="_blank"><img src="https://img.shields.io/discord/520858932613122048.svg?label=Discord&logo=discord&style=flat" alt="Discord" /></a>
</p>

---

# RT Sports Manager – Sports Bankroll Management System

## 📌 Sobre o Projeto

O **RT Sports Manager** é uma plataforma completa de gestão de bancas esportivas, focada em **traders e apostadores profissionais**. A aplicação foi construída com **NestJS** no backend, garantindo **segurança, modularidade e escalabilidade**.

Entre seus recursos estão:
- Gerenciamento de usuários e perfis
- Controle de bancas
- Estatísticas e predições esportivas
- Envio de e-mails transacionais
- Integração com API esportiva (Football)
- Autenticação JWT e confirmação de e-mail

---

## 🚀 Tecnologias Utilizadas

- **NestJS** – Framework backend Node.js
- **Prisma ORM** – Gerenciamento do banco de dados
- **PostgreSQL** – Banco relacional robusto
- **JWT** – Autenticação segura
- **Zod** – Validação de DTOs e schemas
- **TypeScript** – Linguagem de desenvolvimento
- **Jest** – Testes automatizados
- **Handlebars** – Templates de e-mail

---

## 📁 Estrutura de Pastas – RT Sports Manager

```
📦 rtsmanager_backend
├── 📜 README.md # Documentação do projeto
├── 📜 package.json # Dependências e scripts
├── 📜 tsconfig.json # Configuração do TypeScript
├── 📜 jest-e2e.json # Configuração de testes e2e
├── 📜 .env # Variáveis de ambiente (produção/desenvolvimento)
├── 📜 nest-cli.json # Configuração do Nest CLI
├── 📜 nodemon.json # Hot reload em dev
├── 📜 ecosystem.config.js # Arquivo de configuração do PM2
│
├── 📂 .github/workflows # Workflows do GitHub Actions (deploy automático)
│ └── deploy-master.yml
│
├── 📂 prisma # Configuração do Prisma ORM
│ ├── 📂 migrations # Histórico das migrations
│ └── schema.prisma # Definição do schema do banco de dados
│
├── 📂 src # Código-fonte principal da aplicação
│ ├── 📂 config # Configurações globais
│ │ └── prisma.config.ts
│
│ ├── 📂 libs # Bibliotecas reutilizáveis e infraestrutura
│ │ ├── 📂 common # Helpers, tipos, módulos e interfaces comuns
│ │ │ ├── crypto/ # Utilitários de criptografia
│ │ │ ├── database/ # Configuração e conexões do banco
│ │ ├── 📂 services # Serviços utilitários
│ │ │ ├── cache/ # Cache com TTL configurável
│ │ │ │ ├── cache.module.ts
│ │ │ │ └── cache.service.ts
│ │ │ ├── mailer/ # Serviço de e-mail com templates
│ │ │ │ ├── templates/ # Templates de e-mail (.hbs)
│ │ │ │ ├── mail.module.ts
│ │ │ │ └── mail.service.ts
│ │ │ └── notifications/ # Placeholder para notificações
│
│ ├── 📂 modules # Módulos principais do sistema
│ │ ├── 📂 auth # Autenticação (registro, login, e-mail)
│ │ │ ├── dto/ # DTOs de autenticação
│ │ │ ├── guards/ # Guards para autenticação e verificação de e-mail
│ │ │ ├── strategy/ # Estratégia JWT
│ │ │ ├── services/ # Serviços de auth (login, registro etc.)
│ │ │ ├── types/ # Tipagens auxiliares
│ │ │ ├── auth.controller.ts
│ │ │ ├── auth.module.ts
│ │ │ └── auth.service.ts
│ │
│ │ ├── 📂 users # Gestão de usuários
│ │ │ ├── controllers/ # Controller de avatar
│ │ │ ├── proxies/ # Proxy services para operações de usuário
│ │ │ ├── services/ # Serviços para manipulação de usuário
│ │ │ ├── test/ # Testes unitários de controller e service
│ │ │ ├── users.controller.ts
│ │ │ ├── users.module.ts
│ │ │ └── users.service.ts
│ │
│ │ ├── 📂 bankroll # Módulo de gestão de banca (bankrolls)
│ │ │ ├── services/ # Serviços de CRUD da banca
│ │ │ ├── z.dto/ # DTOs validados com Zod
│ │ │ ├── bankroll.controller.ts
│ │ │ └── bankroll.module.ts
│ │
│ │ ├── 📂 client-data # Dados complementares do cliente
│ │ │ ├── controllers/ # Controller de client-data
│ │ │ ├── dto/ # Schemas e DTOs
│ │ │ ├── services/ # CRUD dos dados do cliente
│ │ │ ├── tests/ # Testes unitários e e2e
│ │ │ ├── client-data.module.ts
│ │ │ └── client-data.service.ts
│ │
│ │ ├── 📂 events # Eventos do sistema
│ │ │ ├── dto/ # DTOs dos eventos
│ │ │ ├── events.controller.ts
│ │ │ └── events.service.ts
│ │
│ │ ├── 📂 predictions # Predições esportivas
│ │ ├── 📂 statistics # Estatísticas de partidas
│ │ ├── 📂 subscriptions # Módulo de assinaturas
│ │ ├── 📂 health # Health check da API
│ │ ├── 📂 image # Upload e manipulação de imagens
│
│ ├── 📂 shared # Tipos e declarações globais (custom.d.ts)
│ ├── 📂 api-sports # Integração com API-Sports
│ └── 📂 sports-radar # Integração com Sportradar (futuro)
│
│ └── main.ts # Ponto de entrada da aplicação Nest
│
├── 📂 uploads/avatars # Avatares dos usuários salvos localmente
├── 📂 test/ # Testes automatizados
│ ├── unit/ # Unitários
│ ├── integration/ # Integração (controller + service)
│ └── e2e/ # End-to-end
│
└── 📂 hetzner_server/ # Chaves SSH ou scripts de deploy VPS


---

## 🔒 Segurança e Autenticação

- **JWT** com suporte a `access` e `refresh token`
- **Guards personalizados**:
  - `JwtAuthGuard`
  - `VerifiedEmailGuard`
- Confirmação de e-mail com `token` e redirecionamento para o frontend
- Reset de senha por e-mail

---

## ✉️ Sistema de E-mails

Integração com SMTP (Gmail ou outro provedor), usando `@nestjs-modules/mailer` e templates `.hbs`:

- `email-confirmation.hbs`
- `forgot-password.hbs`
- `welcome.hbs`

Variáveis no `.env`:

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=seu_email@gmail.com
MAIL_PASS=sua_senha
MAIL_FROM="RT Sports Manager <seu_email@gmail.com>"
FRONTEND_URL=http://localhost:3000


⚙️ Como Rodar o Projeto
1️⃣ Clone o repositório
bash
Copiar
Editar
git clone git@github.com:hltav/pgbsports_project.git
cd pgbsports_project
2️⃣ Instale as dependências
bash
Copiar
Editar
npm install
# ou
yarn install
3️⃣ Configure o .env
env
Copiar
Editar
DATABASE_URL=postgresql://user:senha@host:porta/banco
FRONTEND_URL=http://localhost:3000
JWT_SECRET=chave_secreta
JWT_EXPIRES_IN=1h
4️⃣ Execute as migrations do banco
bash
Copiar
Editar
npx prisma migrate dev
5️⃣ Suba a aplicação
bash
Copiar
Editar
npm run start:dev
# ou
yarn start:dev
✅ Rodando Testes
Unitários:

bash
Copiar
Editar
yarn test
Integração (E2E):

bash
Copiar
Editar
yarn test:e2e
🧠 Funcionalidades já implementadas
Autenticação e refresh token

Verificação de e-mail

Upload de avatar

Envio automático de e-mails

Criação e gerenciamento de bancas

Integração com API de esportes

Sistema de cache

Testes unitários e e2e

🤝 Contribuindo
Faça um fork

Crie uma branch: git checkout -b feature/nova-funcionalidade

Commit: git commit -m 'feat: nova funcionalidade'

Push: git push origin feature/nova-funcionalidade

Crie um Pull Request

📄 Licença
Este projeto está licenciado sob a MIT License — utilize livremente, com créditos.

Desenvolvido com 💙 por [Hudson Tavares](https://github.com/hltav)



