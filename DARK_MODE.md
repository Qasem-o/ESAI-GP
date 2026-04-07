# Dark Mode Implementation

## Overview
The website now supports both light and dark modes with a toggle button in the header.

## Features
- **Theme Toggle Button**: Located in the header (sun/moon icon)
- **Persistent Preference**: Theme choice is saved in localStorage
- **System Preference Detection**: Automatically detects and uses system dark mode preference on first visit
- **Smooth Transitions**: Animated icon transitions between light and dark modes

## How It Works

### Theme Provider
The `ThemeContext` manages the theme state across the entire application:
- Checks localStorage for saved preference
- Falls back to system preference if no saved theme
- Applies the `dark` class to the `<html>` element when dark mode is active

### CSS Variables
Dark mode uses CSS custom properties defined in `index.css`:

**Light Mode:**
- Background: White (`0 0% 100%`)
- Foreground: Dark blue (`222.2 84% 4.9%`)
- Primary: Blue (`221.2 83.2% 53.3%`)

**Dark Mode:**
- Background: Dark blue (`222.2 84% 4.9%`)
- Foreground: Light (`210 40% 98%`)
- Primary: Lighter blue (`217.2 91.2% 59.8%`)

### Components
All components using Tailwind CSS classes like `bg-background`, `text-foreground`, `bg-card`, etc. will automatically adapt to the current theme.

## Usage

### For Users
Click the sun/moon icon in the header to toggle between light and dark modes.

### For Developers
To use theme in custom components:

```tsx
import { useTheme } from '../contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

## Files Modified
1. `src/contexts/ThemeContext.tsx` - Theme context provider
2. `src/components/ThemeToggle.tsx` - Toggle button component
3. `src/App.tsx` - Wrapped with ThemeProvider
4. `src/components/Header.tsx` - Added ThemeToggle button
5. `src/index.css` - Added dark mode CSS variables

## Browser Support
Works in all modern browsers that support CSS custom properties and localStorage.
