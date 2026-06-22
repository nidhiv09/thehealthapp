import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";

import {
  sendForgotPasswordOTP,
  verifyAndResetPassword,
} from "../utils/api";

const { width } = Dimensions.get("window");

export default function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [stage, setStage] = useState(1); 
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardOpen(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardOpen(false)
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const extractErrorMessage = (err, fallback) => {
    if (typeof err?.detail === "string") return err.detail;
    if (Array.isArray(err?.detail)) {
      return err.detail.map((e) => e.msg).join(", ");
    }
    return fallback;
  };

  const handleSendOTP = async () => {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      const res = await sendForgotPasswordOTP(email);
      setMessage(res?.message || "OTP sent successfully");
      setStage(2);
    } catch (err) {
      setError(extractErrorMessage(err, "Failed to send OTP"));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setMessage("");

    if (!otp.trim() || !newPassword.trim()) {
      setError("OTP and new password are required");
      return;
    }

    try {
      setLoading(true);
      const res = await verifyAndResetPassword({
        email,
        otp,
        new_password: newPassword,
      });

      setMessage(res?.message || "Password reset successful");

      setTimeout(() => {
        navigation.replace("Login");
      }, 1500);
    } catch (err) {
      setError(extractErrorMessage(err, "Password reset failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LottieView
            source={require("../assets/animations/reset-password.json")}
            autoPlay
            loop
            speed={0.7}
            style={[
              styles.lottie,
              keyboardOpen && styles.lottieSmall,
            ]}
          />

          <Text style={styles.title}>Reset Your Password</Text>

          {stage === 1 ? (
            <>
              <TextInput
                placeholder="Enter your registered email"
                placeholderTextColor="#555"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.disabled]}
                onPress={handleSendOTP}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TextInput
                placeholder="Enter OTP"
                placeholderTextColor="#555"
                value={otp}
                onChangeText={setOtp}
                style={styles.input}
                keyboardType="number-pad"
              />

              <TextInput
                placeholder="New Password"
                placeholderTextColor="#555"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}
              {message ? <Text style={styles.message}>{message}</Text> : null}

              <TouchableOpacity
                style={[styles.button, loading && styles.disabled]}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Resetting..." : "Reset Password"}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF9F5",
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingBottom: 40,
  },

  lottie: {
    width: width * 0.6,
    height: width * 0.6,
    marginBottom: 20,
  },

  lottieSmall: {
    width: width * 0.4,
    height: width * 0.4,
    marginBottom: 10,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "black",
    marginBottom: 20,
    textAlign: "center",
  },

  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "black",
    backgroundColor: "#fff",
  },

  button: {
    width: "100%",
    backgroundColor: "black",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },

  disabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },

  message: {
    color: "green",
    marginBottom: 10,
    textAlign: "center",
  },
});
