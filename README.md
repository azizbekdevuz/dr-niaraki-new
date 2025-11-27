# Dr. Abolghasem Sadeghi-Niaraki - Official Website

A high-performance, modern website built with Next.js 15, React 19, and TypeScript, showcasing Dr. Niaraki's research and academic achievements.

## 🚀 Performance Features

- **Next.js 15** with App Router and React 19
- **Advanced Performance Monitoring** with Web Vitals tracking
- **Device-Aware Rendering** with server-side device detection
- **Optimized Images** with AVIF/WebP support
- **Bundle Analysis** and code splitting optimization
- **Security Headers** and compression enabled

## 📱 Mobile-First Design

- Responsive design optimized for all devices
- Touch-friendly interactions
- Reduced motion support for accessibility
- Progressive enhancement for advanced features

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone [repository-url]
cd dr-niaraki-new

# Install dependencies
yarn install

# Start development server
yarn dev
```

### Available Scripts

```bash
yarn dev          # Start development server
yarn build        # Build for production
yarn start        # Start production server
yarn lint         # Run ESLint
yarn lint:fix     # Auto-fix ESLint issues
yarn perf:check   # Run performance checks
yarn analyze      # Analyze bundle size
yarn type-check   # TypeScript type checking
```

## 🔧 Performance Guidelines

### Code Quality Standards

1. **Import Organization**: Follow ESLint import order rules
2. **Type Safety**: Use proper TypeScript types, avoid `any`
3. **Performance**: Memoize expensive calculations with `useMemo`/`useCallback`
4. **Accessibility**: Follow WCAG guidelines
5. **Error Handling**: Implement proper error boundaries

### Performance Best Practices

1. **Images**: Use Next.js Image component with proper sizing
2. **Animations**: Check device capabilities before enabling advanced animations
3. **Bundle Size**: Monitor with `npm run analyze`
4. **Web Vitals**: Track LCP, FID, CLS metrics
5. **Code Splitting**: Lazy load components when appropriate

### Maintenance

Run performance checks regularly:

```bash
yarn perf:check
```

This will:
- Build the project and check for errors
- Run linting and type checking
- Scan for performance anti-patterns
- Generate bundle analysis

## 🏗️ Architecture

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # Reusable components
│   ├── homepage/       # Homepage-specific components
│   ├── layout/         # Layout components
│   └── shared/         # Shared components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utility functions
├── styles/             # Global styles
└── types/              # TypeScript type definitions
```

### Key Components

- **PerformanceMonitor**: Tracks Web Vitals and performance metrics
- **DeviceProvider**: Handles device detection and responsive behavior
- **ErrorBoundary**: Catches and handles React errors gracefully
- **AtomCursor**: Custom animated cursor for desktop users

## 🔒 Security

- CSP headers configured
- Rate limiting on API endpoints
- Input validation and sanitization
- XSS protection enabled

## 📊 Monitoring

The website includes comprehensive monitoring:

- **Web Vitals**: LCP, FID, CLS, FCP, TTFB, INP
- **Performance Marks**: Custom timing measurements
- **Error Tracking**: Client-side error boundaries
- **Bundle Analysis**: Automated size monitoring

## 🚀 Deployment

The website is optimized for deployment on Vercel, Netlify, or any Node.js hosting platform.

### Build Optimization

- Automatic code splitting
- Image optimization
- CSS optimization
- Bundle compression
- Static generation where possible

## 📈 Performance Targets

- **LCP**: < 2.5s (Good)
- **FID**: < 100ms (Good)  
- **CLS**: < 0.1 (Good)
- **Bundle Size**: < 500KB initial load
- **Lighthouse Score**: > 90 across all metrics

## 🤝 Contributing

1. Follow the established code style and ESLint rules
2. Run `npm run perf:check` before committing
3. Ensure all TypeScript types are properly defined
4. Test on both desktop and mobile devices
5. Maintain performance standards

## 📄 License

This project is proprietary and confidential.
