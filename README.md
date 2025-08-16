# CapStack

A modern React Native mobile application built with Expo, featuring authentication and a beautiful UI design.

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Git](https://git-scm.com/)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/IvanClarion/CapStack.git
   cd CapStack
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the `database/util/` directory
   - Add your Supabase credentials:

   ```env
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

### Running on Different Platforms

- **iOS**: `npm run ios`
- **Android**: `npm run android`
- **Web**: `npm run web`

## 📱 Features

- **Authentication**: Sign in and sign up functionality
- **Modern UI**: Built with NativeWind (Tailwind CSS for React Native)
- **Theme Support**: Light and dark mode support
- **Database Integration**: Supabase backend integration
- **Responsive Design**: Works across iOS, Android, and web platforms

## 🛠 Tech Stack

- **Framework**: React Native with Expo
- **Styling**: NativeWind (Tailwind CSS)
- **Navigation**: Expo Router
- **Backend**: Supabase
- **Icons**: Lucide React Native, Expo Vector Icons
- **State Management**: React Hooks
- **Build Tool**: Metro bundler

## 📁 Project Structure

```
CapStack/
├── app/                    # Main application screens
│   ├── index.jsx          # Sign in screen
│   ├── SignUp.jsx         # Sign up screen
│   └── _layout.jsx        # App layout
├── components/            # Reusable UI components
│   ├── buttons/          # Button components
│   ├── input/            # Input components
│   ├── layout/           # Layout components
│   └── ui/               # UI theme components
├── assets/               # Static assets
│   ├── icons/           # SVG icons
│   ├── images/          # Images
│   └── stylesheet/      # Global CSS
├── database/            # Database configuration
│   └── lib/            # Supabase setup
└── ...config files
```

## 🎨 Component Library

The app uses a custom component library with theme support:

- **ThemeCard**: Blur effect cards with theme awareness
- **ThemeText**: Text with theme-based styling
- **InputView**: Themed input components
- **GeneralButton**: Gradient buttons with consistent styling
- **LayoutView**: Flexible layout containers

## 🔧 Development

### Code Style

This project uses NativeWind for styling. Follow these conventions:

- Use Tailwind classes for styling
- Components should be theme-aware (light/dark mode)
- Follow the existing component structure
- Use TypeScript for better type safety (recommended)

### Adding New Screens

1. Create a new file in the `app/` directory
2. Export a React component as default
3. Navigation is handled automatically by Expo Router

### Adding New Components

1. Create components in the appropriate `components/` subdirectory
2. Follow the existing naming convention (PascalCase)
3. Make components theme-aware when applicable
4. Export as default

## 🚨 Common Issues

### Metro bundler issues

```bash
npx expo start --clear
```

### Environment variables not loading

- Ensure `.env` file is in `database/util/` directory
- Restart the development server after changes

### Supabase connection issues

- Verify your Supabase URL and API key
- Check network connectivity
- Ensure Supabase project is active

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Workflow

1. **Setup**: Follow the installation steps above
2. **Create Branch**: Always work on feature branches
3. **Test**: Test on multiple platforms when possible
4. **Code Review**: All changes require review
5. **Documentation**: Update README if adding new features

## 📄 License

This project is private. All rights reserved.

## 🆘 Support

If you encounter any issues:

1. Check the [Common Issues](#-common-issues) section
2. Search existing [GitHub Issues](https://github.com/IvanClarion/CapStack/issues)
3. Create a new issue with detailed description and steps to reproduce

---

Built with ❤️ using React Native and Expo
