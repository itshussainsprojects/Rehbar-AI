# Rehbar AI - Frontend

> Guiding Your Voice in Every Conversation

A production-ready React/TypeScript application for Rehbar AI, featuring a responsive design, 3D elements, smooth animations, and comprehensive voice assistant capabilities.

## 🚀 Features

- **Modern Tech Stack**: React 18, TypeScript, Vite, Tailwind CSS
- **3D Graphics**: Three.js integration with React Three Fiber
- **Smooth Animations**: Framer Motion with custom transitions
- **Voice Processing**: Web Speech API with Whisper integration
- **Responsive Design**: Mobile-first approach with glass-morphism UI
- **Performance Optimized**: Code splitting, lazy loading, and optimized builds
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🛠 Tech Stack

### Core
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling

### UI & Animation
- **Framer Motion** - Component and route transitions
- **Three.js + React Three Fiber** - 3D graphics and animations
- **Lenis** - GPU-accelerated smooth scrolling
- **GSAP ScrollTrigger** - Scroll-based animations

### Voice & AI
- **Web Speech API** - Voice recognition
- **Whisper API** - Speech-to-text processing
- **Gemini API** - AI conversation processing

### Utilities
- **React Router DOM v6** - Client-side routing
- **Lucide React** - Icon library
- **UA Parser** - OS and browser detection
- **Recharts** - Data visualization

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd rehbar-ai/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run vercel` - Deploy to Vercel

## 🎨 Design System

### Colors
- **Primary**: Gradient blue (#8FD8FF → #3AC3FF)
- **Accent**: Electric violet (#7B61FF)
- **Background**: Pure black (#000000)
- **Text**: Pure white (#FFFFFF)

### Typography
- **Headlines**: Satoshi (900/700 weight)
- **Body**: Space Grotesk (400/500 weight)
- **Code**: JetBrains Mono

### Motion
- **Duration**: 650ms cubic-bezier(0.33, 0.9, 0.45, 1)
- **Stagger**: 80ms between children
- **Target**: 60fps animations

## 📱 Routes

- `/` - Landing page with 3D hero
- `/extension` - Chrome extension page
- `/desktop` - Desktop app page
- `/download` - Auto-redirect based on OS detection
- `/login`, `/signup`, `/forgot` - Authentication
- `/dashboard` - User dashboard
- `/interview` - Interview assistant
- `/history` - Conversation history
- `/profile` - User profile and resume
- `/pricing` - Pricing and upgrade
- `/help` - FAQ and support
- `/admin/*` - Admin portal
- `/privacy`, `/terms` - Legal pages

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation with auto-hide
│   ├── GlassCard.tsx   # Glass-morphism card component
│   ├── PrimaryButton.tsx # Magnetic button with 3D effects
│   └── ...
├── pages/              # Route components
│   ├── Landing.tsx     # 3D hero with compass
│   ├── Extension.tsx   # Chrome extension page
│   ├── Desktop.tsx     # Desktop app page
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useScrollSmooth.ts # Lenis smooth scroll
│   ├── useWhisper.ts   # Voice recognition hook
│   └── ...
├── utils/              # Utility functions
│   ├── cn.ts          # Class name utility
│   ├── osDetect.ts    # OS detection logic
│   └── ...
└── types/              # TypeScript type definitions
```

## 🎯 Performance

- **Lighthouse Score**: 90+ on all metrics
- **Code Splitting**: Route-based lazy loading
- **Font Loading**: Preloaded with fallbacks
- **Image Optimization**: WebP with fallbacks
- **Bundle Size**: Optimized with tree shaking

## ♿ Accessibility

- **WCAG 2.1 AA** compliant
- **Keyboard Navigation** support
- **Screen Reader** compatible
- **Focus Management** with visible indicators
- **Reduced Motion** support for accessibility preferences

## 🌐 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

## 📝 Environment Variables

See `.env.example` for all available configuration options.

Required variables:
- `VITE_GEMINI_KEY` - Google Gemini API key
- `VITE_BASE_URL` - Backend API URL

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run vercel
```

### Manual Build
```bash
npm run build
# Deploy the `dist` folder to your hosting provider
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [docs.rehbar-ai.com](https://docs.rehbar-ai.com)
- **Issues**: GitHub Issues
- **Discord**: [Join our community](https://discord.gg/rehbar-ai)
- **Email**: support@rehbar-ai.com

---

Built with ❤️ by the Rehbar AI team
