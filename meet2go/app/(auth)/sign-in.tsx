import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Link } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/hooks/useAuth';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { colors, spacing, typography } from '@/src/constants/theme';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const [oauthLoading, setOauthLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setOauthLoading(true);
      const redirectTo = Linking.createURL('/');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: false,
        },
      });
      if (error) {
        throw error;
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to start Google sign-in');
    } finally {
      setOauthLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>MEET2GO</Text>
          <Text style={styles.subtitle}>Group decisions made easy</Text>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter your email"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
            />

            <Button
              title="SIGN IN"
              onPress={handleSignIn}
              loading={loading}
              style={styles.button}
            />

          <Button
            title="CONTINUE WITH GOOGLE"
            onPress={handleGoogleSignIn}
            loading={oauthLoading}
            variant="secondary"
              style={styles.button}
            />

            <Link href="/(auth)/sign-up" asChild>
              <Text style={styles.link}>
                Don't have an account? <Text style={styles.linkBold}>Sign up</Text>
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  title: {
    ...typography.title,
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.primary,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },
  form: {
    width: '100%',
  },
  button: {
    marginTop: spacing.lg,
  },
  link: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.lg,
    color: colors.textSecondary,
  },
  linkBold: {
    color: colors.primary,
    fontWeight: '700',
  },
});


