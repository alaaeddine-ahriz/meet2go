import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
// import * as Linking from 'expo-linking';
// import * as AuthSession from 'expo-auth-session';
// import * as WebBrowser from 'expo-web-browser';
import { supabase } from '@/src/lib/supabase';
import { useAuth } from '@/src/hooks/useAuth';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { colors, spacing, typography } from '@/src/constants/theme';
import PaperBackground from '@/src/components/PaperBackground';
import { RoughNotationWrapper } from '@/src/components/ui/RoughNotationWrapper';
import { showAlert } from '@/src/utils/alert';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  // const [oauthLoading, setOauthLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      showAlert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   try {
  //     setOauthLoading(true);
  //     // Ensure auth session can complete on iOS
  //     WebBrowser.maybeCompleteAuthSession();

  //     // For Expo Go, proxy works more reliably; custom scheme also supported
  //     const redirectTo = AuthSession.makeRedirectUri({
  //       scheme: 'meet2go',
  //       useProxy: true,
  //       preferLocalhost: false,
  //     });

  //     const { data, error } = await supabase.auth.signInWithOAuth({
  //       provider: 'google',
  //       options: {
  //         redirectTo,
  //         skipBrowserRedirect: true,
  //       },
  //     });

  //     if (error) throw error;

  //     if (data?.url) {
  //       const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  //       if (res.type === 'success' && res.url) {
  //         // Deep link handled by supabase-js; no-op here
  //       }
  //     }
  //   } catch (error: any) {
  //     showAlert('Error', error.message || 'Failed to start Google sign-in');
  //   } finally {
  //     setOauthLoading(false);
  //   }
  // };

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
                <Text style={styles.title}>SIGN IN</Text>
              </RoughNotationWrapper>
            </View>

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

          {/* <Button
            title="CONTINUE WITH GOOGLE"
            onPress={handleGoogleSignIn}
            loading={oauthLoading}
            variant="secondary"
              style={styles.button}
            /> */}

            <Link href="/(auth)/sign-up" asChild>
              <Text style={styles.link}>
                Don't have an account? <Text style={styles.linkBold}>Sign up</Text>
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


