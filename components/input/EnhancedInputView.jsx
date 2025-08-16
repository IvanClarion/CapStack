import React, { useState, useCallback } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Undo, Redo } from 'lucide-react-native';
import InputView from './InputView';
import ThemeIcon from '../ui/ThemeIcon';
import ThemeText from '../ui/ThemeText';
import { useUndoRedo } from '../../hooks/useUndoRedo';
import clsx from 'clsx';

/**
 * Enhanced input component with undo/redo functionality
 * Provides input field with built-in history management
 *
 * @param {Object} props - Component props
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.className - Additional CSS classes
 * @param {Function} props.onValueChange - Callback when value changes
 * @param {boolean} props.showUndoRedo - Whether to show undo/redo buttons (default: true)
 * @param {string} props.initialValue - Initial input value (default: '')
 * @param {...Object} props.otherProps - Other props passed to InputView
 */
const EnhancedInputView = ({
  placeholder = '',
  className = '',
  onValueChange,
  showUndoRedo = true,
  initialValue = '',
  ...props
}) => {
  // Use the undo/redo hook for state management
  const { value, setValue, undo, redo, canUndo, canRedo } = useUndoRedo(initialValue);

  // Local state for immediate input feedback (before committing to history)
  const [localValue, setLocalValue] = useState(value);

  /**
   * Handle text input changes
   * Updates local state immediately and commits to history after a brief delay
   */
  const handleTextChange = useCallback(
    text => {
      setLocalValue(text);

      // Debounce the history update to avoid creating too many history entries
      // In a real app, you might want to use a proper debounce library
      clearTimeout(handleTextChange.timeoutId);
      handleTextChange.timeoutId = setTimeout(() => {
        setValue(text);
        onValueChange?.(text);
      }, 500); // 500ms delay before adding to history
    },
    [setValue, onValueChange]
  );

  /**
   * Handle undo operation
   */
  const handleUndo = useCallback(() => {
    undo();
    setLocalValue(value); // Update local value to match undo result
    // Note: In the next render, value will be the undone value
  }, [undo, value]);

  /**
   * Handle redo operation
   */
  const handleRedo = useCallback(() => {
    redo();
    setLocalValue(value); // Update local value to match redo result
    // Note: In the next render, value will be the redone value
  }, [redo, value]);

  // Update local value when the history value changes (from undo/redo)
  React.useEffect(() => {
    setLocalValue(value);
    onValueChange?.(value);
  }, [value, onValueChange]);

  return (
    <View className="w-full">
      {/* Main input container */}
      <View className="flex-row items-center">
        <View className="flex-1">
          <InputView
            placeholder={placeholder}
            className={clsx('generalInput', className)}
            value={localValue}
            onChangeText={handleTextChange}
            {...props}
          />
        </View>

        {/* Undo/Redo controls */}
        {showUndoRedo && (
          <View className="flex-row ml-2 gap-1">
            <TouchableOpacity
              onPress={handleUndo}
              disabled={!canUndo}
              className={clsx('p-2 rounded', canUndo ? 'opacity-100' : 'opacity-40')}
            >
              <ThemeIcon>
                <Undo size={16} color={canUndo ? '#6B7280' : '#D1D5DB'} />
              </ThemeIcon>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleRedo}
              disabled={!canRedo}
              className={clsx('p-2 rounded', canRedo ? 'opacity-100' : 'opacity-40')}
            >
              <ThemeIcon>
                <Redo size={16} color={canRedo ? '#6B7280' : '#D1D5DB'} />
              </ThemeIcon>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Optional debug info (can be removed in production) */}
      {__DEV__ && showUndoRedo && (
        <ThemeText className="text-xs opacity-60 mt-1">
          History: {canUndo ? '←' : ''} {canRedo ? '→' : ''}
        </ThemeText>
      )}
    </View>
  );
};

export default EnhancedInputView;
