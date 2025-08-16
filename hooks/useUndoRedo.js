import { useState, useCallback } from 'react';

/**
 * Custom hook for undo/redo functionality
 * Manages state history and provides undo/redo operations
 *
 * @param {any} initialValue - Initial value for the state
 * @param {number} maxHistorySize - Maximum number of history states to keep (default: 50)
 * @returns {Object} Object containing current value, setter, undo, redo, and status functions
 */
export const useUndoRedo = (initialValue, maxHistorySize = 50) => {
  // State to store the history of values
  const [history, setHistory] = useState([initialValue]);
  // Current position in the history array
  const [currentIndex, setCurrentIndex] = useState(0);

  // Current value is the value at the current index
  const currentValue = history[currentIndex];

  /**
   * Set a new value and add it to history
   * @param {any} newValue - New value to set
   */
  const setValue = useCallback(
    newValue => {
      setHistory(prevHistory => {
        // If we're not at the end of history, remove everything after current index
        const newHistory = prevHistory.slice(0, currentIndex + 1);

        // Add the new value
        newHistory.push(newValue);

        // Limit history size to maxHistorySize
        if (newHistory.length > maxHistorySize) {
          return newHistory.slice(-maxHistorySize);
        }

        return newHistory;
      });

      // Move to the new current index
      setCurrentIndex(prevIndex => {
        const newIndex = Math.min(prevIndex + 1, maxHistorySize - 1);
        return newIndex;
      });
    },
    [currentIndex, maxHistorySize]
  );

  /**
   * Undo the last operation
   */
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  /**
   * Redo the next operation
   */
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, history.length]);

  /**
   * Check if undo is possible
   */
  const canUndo = currentIndex > 0;

  /**
   * Check if redo is possible
   */
  const canRedo = currentIndex < history.length - 1;

  /**
   * Reset the history to initial value
   */
  const reset = useCallback(() => {
    setHistory([initialValue]);
    setCurrentIndex(0);
  }, [initialValue]);

  /**
   * Clear all history and set a new initial value
   */
  const clear = useCallback(
    (newInitialValue = initialValue) => {
      setHistory([newInitialValue]);
      setCurrentIndex(0);
    },
    [initialValue]
  );

  return {
    value: currentValue,
    setValue,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    clear,
    historySize: history.length,
    currentPosition: currentIndex + 1, // 1-based position for display
  };
};
