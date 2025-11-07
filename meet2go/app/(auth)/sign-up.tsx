import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '@/src/hooks/useAuth';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { colors, spacing, typography } from '@/src/constants/theme';
import PaperBackground from '@/src/components/PaperBackground';
import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';
import { showAlert } from '@/src/utils/alert';

export default function SignUpScreen() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSignUp = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, displayName || undefined);
      showAlert('Success', 'Account created! Please sign in.');
      router.replace('/(auth)/sign-in');
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <View style={styles.titleContainer}>
              <RoughNotationWrapper type="highlight" color="#DDA0DD" show={true}>
                <Text style={styles.title}>SIGN UP</Text>
              </RoughNotationWrapper>
            </View>

            <View style={styles.form}>
            <Input
              label="Display Name (Optional)"
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="How should we call you?"
            />

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
              placeholder="At least 6 characters"
            />

            <Button
              title="SIGN UP"
              onPress={handleSignUp}
              loading={loading}
              style={styles.button}
            />

            <Link href="/(auth)/sign-in" asChild>
              <Text style={styles.link}>
                Already have an account? <Text style={styles.linkBold}>Sign in</Text>
              </Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </PaperBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: spacing.xxl + 40,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    ...typography.headline,
    textAlign: 'center',
    color: colors.text,
    fontWeight: '700',
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


