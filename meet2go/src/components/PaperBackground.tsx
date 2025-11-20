import React, { ReactNode } from 'react';
import { ImageBackground, StyleSheet, View, Platform } from 'react-native';

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
      <View style={[styles.content, Platform.OS === 'web' && styles.webContent]}>
        {children}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  webContent: {
    maxWidth: 520,
    alignSelf: 'center',
    width: '100%',
    flex: 1,
  },
  image: {
    opacity: 0.5,
  },
});


