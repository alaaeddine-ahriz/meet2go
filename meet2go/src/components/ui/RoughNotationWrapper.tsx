import React from 'react';
import { Platform } from 'react-native';
import { RoughNotation } from 'react-rough-notation';

interface RoughNotationWrapperProps {
  type?: 'highlight' | 'underline' | 'circle' | 'box' | 'bracket' | 'strike-through' | 'crossed-off';
  color?: string;
  strokeWidth?: number;
  show?: boolean;
  children: React.ReactNode;
}

export function RoughNotationWrapper({
  type = 'highlight',
  color = '#FFD700',
  strokeWidth = 2,
  show = true,
  children,
}: RoughNotationWrapperProps) {
  // Only render RoughNotation on web platform
  if (Platform.OS === 'web') {
    return (
      <span style={{ display: 'inline-block' }}>
        <RoughNotation
          type={type}
          color={color}
          strokeWidth={strokeWidth}
          show={show}
        >
          {children}
        </RoughNotation>
      </span>
    );
  }

  // On native platforms, just render children as-is
  return <>{children}</>;
}

