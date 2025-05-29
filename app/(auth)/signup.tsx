import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Controller, useForm } from 'react-hook-form';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { AlertNotificationRoot, Toast } from 'react-native-alert-notification';

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupScreen() {
  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<SignupForm>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data: SignupForm) => {
    try {
      setIsLoading(true);
      setError(null);

      await signUp(data.name, data.email, data.password);
      
      Toast.show({
        type: 'success',
        title: 'Success',
        textBody: 'Account created successfully! Please verify your email.',
      });

      router.replace('/(auth)/login');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred during sign up';
      setError(message);

      Toast.show({
        type: 'danger',
        title: 'Error',
        textBody: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError('Google sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.replace('/(auth)/login');
  };

  return (
    <AlertNotificationRoot>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.colors.background }]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          entering={FadeInDown.duration(1000)}
          style={styles.header}
        >
          <Text style={[styles.title, { color: theme.colors.primary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.secondary }]}>
            Join our community today
          </Text>
        </Animated.View>

        {error && (
          <Animated.View 
            entering={FadeInUp.duration(500)}
            style={styles.errorContainer}
          >
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          </Animated.View>
        )}

        <Animated.View 
          entering={FadeInUp.delay(300).duration(1000)}
          style={styles.form}
        >
          <Controller
            control={control}
            rules={{
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Full Name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                mode="outlined"
                style={styles.input}
                error={!!errors.name}
                left={<TextInput.Icon icon="account" />}
              />
            )}
            name="name"
          />
          {errors.name && (
            <Text style={[styles.fieldError, { color: theme.colors.error }]}>
              {errors.name.message}
            </Text>
          )}

          <Controller
            control={control}
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize="none"
                keyboardType="email-address"
                mode="outlined"
                style={styles.input}
                error={!!errors.email}
                left={<TextInput.Icon icon="email" />}
              />
            )}
            name="email"
          />
          {errors.email && (
            <Text style={[styles.fieldError, { color: theme.colors.error }]}>
              {errors.email.message}
            </Text>
          )}

          <Controller
            control={control}
            rules={{
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                message: 'Password must contain uppercase, lowercase, number and special character',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                mode="outlined"
                style={styles.input}
                error={!!errors.password}
                left={<TextInput.Icon icon="lock" />}
              />
            )}
            name="password"
          />
          {errors.password && (
            <Text style={[styles.fieldError, { color: theme.colors.error }]}>
              {errors.password.message}
            </Text>
          )}

          <Controller
            control={control}
            rules={{
              required: 'Please confirm your password',
              validate: value => value === password || 'Passwords do not match',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Confirm Password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                secureTextEntry
                mode="outlined"
                style={styles.input}
                error={!!errors.confirmPassword}
                left={<TextInput.Icon icon="lock-check" />}
              />
            )}
            name="confirmPassword"
          />
          {errors.confirmPassword && (
            <Text style={[styles.fieldError, { color: theme.colors.error }]}>
              {errors.confirmPassword.message}
            </Text>
          )}

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            contentStyle={styles.buttonContent}
          >
            Create Account
          </Button>

          <View style={styles.divider}>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
            <Text style={[styles.dividerText, { color: theme.colors.outline }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.colors.outline }]} />
          </View>

          <Button
            mode="outlined"
            onPress={handleGoogleSignUp}
            loading={isLoading}
            disabled={isLoading}
            icon="google"
            style={styles.googleButton}
            contentStyle={styles.buttonContent}
          >
            Sign up with Google
          </Button>
        </Animated.View>

        <Animated.View 
          entering={FadeInUp.delay(600).duration(1000)}
          style={styles.footer}
        >
          <Text style={[styles.footerText, { color: theme.colors.outline }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={goToLogin}>
            <Text style={[styles.footerLink, { color: theme.colors.primary }]}>
              Sign In
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'web' ? 40 : 60,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Inter-Regular',
    opacity: 0.7,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  fieldError: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 12,
    marginTop: -4,
    marginLeft: 8,
  },
  button: {
    marginTop: 16,
    borderRadius: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    opacity: 0.2,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  googleButton: {
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    marginRight: 4,
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});