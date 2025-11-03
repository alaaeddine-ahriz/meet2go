import React, { ReactNode } from 'react';
import { ImageBackground, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

export default function PaperBackground({ children }: Props) {
  return (
    <ImageBackground
      source={require('@/assets/images/paper.jpg')}
      style={styles.background}
      imageStyle={styles.image}
      resizeMode="cover"
    >
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  image: {
    opacity: 0.5,
  },
});


