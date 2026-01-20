# Bolão do Oscar 2026 - Diamond Films

Landing page interativa para participação no Bolão do Oscar 2026 da Diamond Films.

## 🎬 Sobre o Projeto

Uma landing page moderna e interativa que permite aos usuários participar do Bolão do Oscar 2026, fazer suas previsões sobre os vencedores, criar bolões personalizados com amigos e concorrer a prêmios incríveis.

## 🚀 Tecnologias

- **Next.js 16** - Framework React para produção
- **TypeScript** - Tipagem estática para JavaScript
- **Tailwind CSS** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis e customizáveis
- **React Hook Form** - Gerenciamento de formulários
- **Lucide React** - Ícones modernos

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18.x ou superior
- **pnpm** (gerenciador de pacotes recomendado)

Para instalar o pnpm, execute:
```bash
npm install -g pnpm
```

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/Curling-AI/dimond-films-landing-oscar.git
cd dimond-films-landing-oscar
```

2. Instale as dependências:
```bash
pnpm install
```

## ▶️ Executando o Projeto

### Modo de Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
pnpm dev
```

O projeto estará disponível em [http://localhost:3000](http://localhost:3000)

### Build de Produção

Para criar uma build otimizada:

```bash
pnpm build
```

Para executar a build de produção:

```bash
pnpm start
```

### Linter

Para executar o linter:

```bash
pnpm lint
```

## 📁 Estrutura do Projeto

```
oscar-pool-landing-page/
├── app/                      # Diretório principal do Next.js App Router
│   ├── globals.css          # Estilos globais
│   ├── layout.tsx           # Layout raiz da aplicação
│   └── page.tsx             # Página principal
├── components/              # Componentes React
│   ├── ui/                  # Componentes de UI reutilizáveis
│   ├── hero-section.tsx     # Seção hero da landing page
│   ├── registration-form.tsx # Formulário de registro
│   ├── game-mode-selector.tsx # Seletor de modo de jogo
│   ├── oscar-quiz.tsx       # Quiz de previsões
│   └── ...                  # Outros componentes
├── lib/                     # Utilitários e helpers
├── public/                  # Arquivos estáticos
├── hooks/                   # React hooks customizados
└── styles/                  # Arquivos de estilo adicionais
```

## 🎯 Funcionalidades

- ✨ Seção hero impactante com tema cinematográfico
- 📝 Formulário de registro de usuários
- 🎮 Seleção de modo de jogo (individual ou em grupo)
- 🎬 Quiz interativo para fazer previsões dos vencedores do Oscar
- 🏆 Seção de rankings
- 🎁 Informações sobre prêmios
- 📱 Design totalmente responsivo
- 🌙 Tema dark elegante

## 📄 Licença

Este projeto é propriedade da Diamond Films.
