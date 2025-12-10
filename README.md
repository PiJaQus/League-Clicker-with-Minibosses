# League Clicker with Minibosses

A League of Legends-themed cookie clicker game with boss battles and quest system, built with Vue 3 and Vite.

## 🎮 Features

- **Click to Earn**: Click Leblanc to earn gold
- **Rank Progression**: 9 ranks from Iron to Challenger with unique bosses
- **Upgrades**:
    - **Jungle Camps** (Click Power): Wraiths, Wolves, Golems
    - **Champions** (Production): Garen, Ahri, Ashe, Yasuo, Lux, Faker, Dopa, Scuttle Crab
- **Boss Fights**: Defeat bosses with Attack/HP upgrades to rank up
- **Multi-Language**: English, Polish, German (EN/PL/DE)
- **Settings**:
    - Sound toggle
    - Battle Music toggle (Strudel.js)
    - Confetti animations
    - Language selector
    - Reset game
- **Achievements**: Track defeated bosses
- **Admin Panel**: Test mode with gold cheats (password: "leblanc")
- **Responsive Design**: Works on desktop and mobile

## 🛠️ Tech Stack

- **Vue 3** (Composition API)
- **JavaScript** (no TypeScript)
- **Web Audio API** (sounds and music)
- **Strudel.js** (procedural battle music)
- **localStorage** (persistence)
- **i18n** (internationalization)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Docker

### Local Development

```bash
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

### Docker

```bash
docker-compose up
```

The application will be available at `http://localhost:80`

## 📁 Project Structure

```
League-Clicker-with-Minibosses/
├── code/
│   └── cooker/              # Vue 3 + Vite frontend application
│       ├── src/
│       │   ├── components/  # Vue components
│       │   ├── views/       # Page views
│       │   ├── assets/      # Images and stylesheets
│       │   ├── utils/       # Utility functions
│       │   ├── store/       # State management
│       │   ├── router/      # Vue Router configuration
│       │   └── i18n/        # Internationalization
│       └── public/          # Static assets
│       
├── .gitignore               # Git ignore rules
├── .prettierrc.json         # Prettier configuration
├── LICENSE
├── README.md
├── index.html               # Entry point
├── docker-compose.yml
├── eslint.config.ts         # ESLint configuration
├── package.json             # Dependencies
├── package-lock.json
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts           # Vite configuration
└── data/                    # Data directory

```

## 🎯 Game Progression

1. **Iron** (0 gold) - Start here
2. **Bronze** (10K gold) - Fight Scuttle Crab
3. **Silver** (50K gold) - Fight Rift Herald
4. **Gold** (150K gold) - Fight Dragon
5. **Platinum** (500K gold) - Fight Nashor
6. **Diamond** (1.5M gold) - Fight Baron Nashor
7. **Master** (5M gold) - Fight Elder Dragon
8. **Grandmaster** (15M gold) - Fight Void Herald
9. **Challenger** (50M gold) - Fight Nexus (WIN!)

## 🔐 Admin Panel

Access admin panel with password: **leblanc**

Features:
- Add gold for testing
- Change language
- Reset game

## 🌍 Languages

- **English** (en)
- **Polski** (pl)
- **Deutsch** (de)

All UI text is fully translated!

## 👨‍💻 Author

**Kevin Owczarzak**

## 📝 License

MIT License - See [LICENSE](LICENSE) file for details

**Game view**

<img width="1048" height="919" alt="Bildschirmfoto 2025-12-10 um 12 54 20" src="https://github.com/user-attachments/assets/2460dab8-b3bd-4799-a5cf-bb304519969e" />

<img width="1182" height="917" alt="Bildschirmfoto 2025-12-10 um 12 53 56" src="https://github.com/user-attachments/assets/483dfe5b-f66c-43d0-866f-319aab16bc4a" />



