/**
 * Performance monitoring utilities for CapStack
 * Provides simple performance measurement and optimization helpers
 */
import React from 'react';

/**
 * Simple performance timer for measuring function execution time
 * @param {string} label - Label for the performance measurement
 * @returns {Function} Function to end the timer and log results
 */
export const startPerformanceTimer = label => {
  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`⏱️ Performance [${label}]: ${duration.toFixed(2)}ms`);
    return duration;
  };
};

/**
 * Decorator function to measure component render performance
 * @param {React.Component} Component - React component to wrap
 * @param {string} componentName - Name for performance tracking
 * @returns {React.Component} Wrapped component with performance monitoring
 */
export const withPerformanceMonitoring = (Component, componentName) => {
  return React.memo(props => {
    const endTimer = startPerformanceTimer(`${componentName} Render`);

    React.useEffect(() => {
      endTimer();
    });

    return <Component {...props} />;
  });
};

/**
 * Hook to measure component mount and unmount times
 * @param {string} componentName - Name of the component for logging
 */
export const usePerformanceMonitoring = componentName => {
  React.useEffect(() => {
    const mountTime = performance.now();
    console.log(`🚀 Component [${componentName}] mounted at ${mountTime.toFixed(2)}ms`);

    return () => {
      const unmountTime = performance.now();
      const lifeDuration = unmountTime - mountTime;
      console.log(`💀 Component [${componentName}] unmounted after ${lifeDuration.toFixed(2)}ms`);
    };
  }, [componentName]);
};

/**
 * Debounce function to optimize frequent function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @param {boolean} immediate - Whether to execute immediately on first call
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait, immediate = false) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
};

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;

  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Memoization function for expensive calculations
 * @param {Function} fn - Function to memoize
 * @param {Function} keyGenerator - Optional function to generate cache keys
 * @returns {Function} Memoized function
 */
export const memoize = (fn, keyGenerator = JSON.stringify) => {
  const cache = new Map();

  return (...args) => {
    const key = keyGenerator(args);

    if (cache.has(key)) {
      console.log(`📋 Cache hit for key: ${key}`);
      return cache.get(key);
    }

    console.log(`🔄 Cache miss for key: ${key}`);
    const result = fn(...args);
    cache.set(key, result);

    return result;
  };
};

/**
 * Performance optimization recommendations based on common React Native patterns
 */
export const PERFORMANCE_TIPS = {
  IMAGES: {
    tip: 'Optimize images by using appropriate formats (WebP when possible) and sizes',
    implementation: 'Use react-native-fast-image for better image caching and performance',
  },
  LISTS: {
    tip: 'Use FlatList or VirtualizedList for large datasets instead of ScrollView',
    implementation: 'Implement getItemLayout, keyExtractor, and removeClippedSubviews props',
  },
  ANIMATIONS: {
    tip: 'Use react-native-reanimated for smooth 60fps animations',
    implementation: 'Prefer useSharedValue and runOnUI for complex animations',
  },
  NAVIGATION: {
    tip: 'Enable lazy loading for navigation screens to reduce initial bundle size',
    implementation: 'Use React.lazy() and Suspense for code splitting',
  },
  STATE: {
    tip: 'Minimize unnecessary re-renders by optimizing state updates',
    implementation: 'Use React.memo, useMemo, and useCallback strategically',
  },
};

/**
 * Log performance recommendations
 */
export const logPerformanceTips = () => {
  console.log('🚀 Performance Optimization Tips:');
  Object.entries(PERFORMANCE_TIPS).forEach(([category, { tip, implementation }]) => {
    console.log(`📍 ${category}: ${tip}`);
    console.log(`   💡 Implementation: ${implementation}`);
  });
};
