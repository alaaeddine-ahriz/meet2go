import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { AlertDialog, AlertButton } from '@/src/components/ui/AlertDialog';
import { AlertConfig, setAlertDialogShowFn } from '@/src/utils/alert';

interface AlertDialogContextType {
  showAlertDialog: (config: AlertConfig) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

export function useAlertDialog() {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within AlertDialogProvider');
  }
  return context;
}

interface AlertDialogProviderProps {
  children: React.ReactNode;
}

export function AlertDialogProvider({ children }: AlertDialogProviderProps) {
  const [alertConfig, setAlertConfig] = useState<AlertConfig & { visible: boolean }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlertDialog = useCallback((config: AlertConfig) => {
    setAlertConfig({
      ...config,
      visible: true,
    });
  }, []);

  const dismissAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  // Register the alert dialog function with the alert utility
  useEffect(() => {
    if (Platform.OS === 'web') {
      setAlertDialogShowFn(showAlertDialog);
    }
  }, [showAlertDialog]);

  // Only render AlertDialog on web
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  return (
    <AlertDialogContext.Provider value={{ showAlertDialog }}>
      {children}
      <AlertDialog
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={dismissAlert}
      />
    </AlertDialogContext.Provider>
  );
}

