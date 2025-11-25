import { Alert, Platform } from 'react-native';
import { AlertButton } from '@/src/components/ui/AlertDialog';

// This will be set by ToastProvider
let toastShowFn: ((message: string, type?: 'success' | 'error' | 'info') => void) | null = null;
let alertDialogShowFn: ((config: AlertConfig) => void) | null = null;

export interface AlertConfig {
  title: string;
  message: string;
  buttons: AlertButton[];
}

export function setToastShowFn(fn: (message: string, type?: 'success' | 'error' | 'info') => void) {
  toastShowFn = fn;
}

export function setAlertDialogShowFn(fn: (config: AlertConfig) => void) {
  alertDialogShowFn = fn;
}

/**
 * Platform-aware alert function
 * - Native: Uses React Native's Alert.alert()
 * - Web: Uses toast notifications for simple alerts, AlertDialog for multi-button alerts
 */
export function showAlert(
  title: string,
  message: string,
  buttons?: AlertButton[]
): void {
  const defaultButtons: AlertButton[] = buttons || [
    { text: 'OK', onPress: () => {} },
  ];

  if (Platform.OS === 'web') {
    // For web, use toast for simple alerts (single button with default text and no custom action)
    const isSimpleAlert = defaultButtons.length === 1 && 
                          defaultButtons[0].text === 'OK' && 
                          (!defaultButtons[0].onPress || defaultButtons[0].onPress.toString().includes('() => {}'));
    
    if (isSimpleAlert) {
      const type = title.toLowerCase().includes('error') ? 'error' : 
                   title.toLowerCase().includes('success') ? 'success' : 
                   'info';
      if (toastShowFn) {
        toastShowFn(message, type);
        // Call onPress if it exists (even if it's a no-op)
        if (defaultButtons[0].onPress) {
          defaultButtons[0].onPress();
        }
      } else {
        // Fallback to browser alert if toast system not initialized
        window.alert(`${title}\n\n${message}`);
        if (defaultButtons[0].onPress) {
          defaultButtons[0].onPress();
        }
      }
    } else {
      // For multi-button alerts or custom buttons, use AlertDialog
      if (alertDialogShowFn) {
        alertDialogShowFn({ title, message, buttons: defaultButtons });
      } else {
        // Fallback to browser confirm/alert
        if (defaultButtons.length > 1) {
          const result = window.confirm(`${title}\n\n${message}`);
          if (result && defaultButtons[0]) {
            defaultButtons[0].onPress();
          } else if (!result && defaultButtons[1]) {
            defaultButtons[1].onPress();
          }
        } else {
          window.alert(`${title}\n\n${message}`);
          if (defaultButtons[0] && defaultButtons[0].onPress) {
            defaultButtons[0].onPress();
          }
        }
      }
    }
  } else {
    // Native: Use React Native Alert
    Alert.alert(title, message, defaultButtons);
  }
}

