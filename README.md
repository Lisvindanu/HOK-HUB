# HoK Hub 🎮

> Your ultimate companion for Honor of Kings - Master the Meta, Rule the Gorge

A modern, feature-rich web application for Honor of Kings players. Built with React, TypeScript, and the latest web technologies.

![Hero Database](https://img.shields.io/badge/Heroes-111-blue)
![Skins](https://img.shields.io/badge/Skins-1394+-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🏠 Home Page
- Beautiful hero-focused landing page
- Quick access to all features
- Top meta heroes showcase
- Animated background effects

### 👥 Hero Database
- Browse all 111 heroes
- Advanced filtering by role, lane, tier
- Real-time search functionality
- Sort by win rate, pick rate, ban rate, tier
- Detailed hero stats

### 📊 Analytics (Coming Soon)
- Interactive charts and visualizations
- Meta trends over time
- Hero performance analytics
- Role distribution analysis

### ⚔️ Counter Picks (Coming Soon)
- Find best counter picks
- Hero matchup analysis
- Strengths and weaknesses

### 🎨 Skin Gallery (Coming Soon)
- Browse 1,394+ skins
- Filter by hero and rarity
- High-quality skin images
- Collection tracker

### 👑 Tier List (Coming Soon)
- Current meta tier rankings
- Drag-and-drop tier list creator
- Community tier lists

## 🚀 Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Routing:** TanStack Router (file-based routing)
- **Data Fetching:** TanStack Query (React Query)
- **Styling:** TailwindCSS
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Icons:** Lucide React

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Lisvindanu/HonorOfKingsApi.git

# Navigate to the hok-hub directory
cd hok-hub

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🛠️ Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 📁 Project Structure

```
hok-hub/
├── src/
│   ├── api/              # API service functions
│   ├── components/       # Reusable components
│   │   ├── hero/        # Hero-related components
│   │   ├── layout/      # Layout components (Header, Footer)
│   │   └── ui/          # UI components (Loading, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions
│   ├── pages/           # Page components
│   ├── routes/          # TanStack Router routes
│   ├── types/           # TypeScript type definitions
│   ├── App.tsx          # Main App component
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── package.json
```

## 🎨 Design Principles

- **Modern & Clean:** Inspired by hok-draft.web.id's aesthetic
- **Dark Theme:** Optimized for gaming experience
- **Responsive:** Mobile-first design approach
- **Performance:** Optimized loading with code splitting
- **Accessibility:** WCAG 2.1 compliant

## 🔗 API

This project uses the [HoK API](http://hokapi.project-n.site/) for hero data.

**Endpoints:**
- `GET /api/hok` - Get all heroes
- `GET /api/status` - API status
- `GET /health` - Health check

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This project is not affiliated with, endorsed by, or in any way officially connected with Tencent or Honor of Kings. All game content, hero names, images, and related materials are property of their respective owners.

## 🙏 Acknowledgments

- [Honor of Kings](https://www.honorofkings.com/) for the amazing game
- [HoK Draft](https://www.hok-draft.web.id/) for design inspiration
- Community contributors and supporters

---

Made with ❤️ for the HoK community
