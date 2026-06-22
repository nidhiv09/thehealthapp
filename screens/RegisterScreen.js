import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import LottieView from "lottie-react-native";

import { registerUser } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const { width } = Dimensions.get("window");

export default function RegisterScreen() {
  const { login } = useAuth();

  const steps = [
    "name",
    "email",
    "password",
    "sex",
    "age",
    "weight_height",
    "medications",
    "cardiac",
    "cardiac_note",
    "sleep_start",
    "sleep_end",
  ];

  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(null);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    sex: null,
    age: "",
    weight: "",
    height: "",
    medications: "",
    cardiac: null,
    cardiac_note: "",
    sleep_start: null,
    sleep_end: null,
  });

  const currentStep = steps[step];
  const progressWidth = ((step + 1) / steps.length) * width;

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

  const validateStep = () => {
    switch (currentStep) {
      case "name":
        return form.name.trim();
      case "email":
        return form.email.trim();
      case "password":
        return form.password.length >= 6;
      case "sex":
        return form.sex !== null;
      case "age":
        return Number(form.age) > 0;
      case "weight_height":
        return Number(form.weight) > 0 && Number(form.height) > 0;
      case "medications":
        return form.medications.trim();
      case "cardiac":
        return form.cardiac !== null;
      case "cardiac_note":
        return form.cardiac ? form.cardiac_note.trim() : true;
      default:
        return true;
    }
  };

  const next = () => {
    if (!validateStep()) {
      setError("Please complete this step");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError("");

    try {
      if (
        form.sleep_start &&
        form.sleep_end &&
        form.sleep_start.getHours() === form.sleep_end.getHours() &&
        form.sleep_start.getMinutes() === form.sleep_end.getMinutes()
      ) {
        setError("Sleep start and end cannot be the same");
        setLoading(false);
        return;
      }

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        health: {
          age: Number(form.age),
          sex: form.sex,
          weight: Number(form.weight),
          height: Number(form.height),
          medications: form.medications,
          prior_cardiac_history: form.cardiac,
          cardiac_history_note: form.cardiac ? form.cardiac_note : null,
        },
        sleep_start: form.sleep_start
          ? form.sleep_start.toISOString()
          : null,
        sleep_end: form.sleep_end
          ? form.sleep_end.toISOString()
          : null,
      };

      await registerUser(payload);
      await login({ email: form.email, password: form.password });
    } catch (err) {
      setError(err?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case "name":
        return (
          <>
            <Text style={styles.label}>What should we call you?</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
          </>
        );

      case "email":
        return (
          <>
            <Text style={styles.label}>Enter your email</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
            />
          </>
        );

      case "password":
        return (
          <>
            <Text style={styles.label}>Create a password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={form.password}
              onChangeText={(t) => setForm({ ...form, password: t })}
            />
          </>
        );

      case "sex":
        return (
          <>
            <Text style={styles.label}>Your gender</Text>
            <View style={styles.row}>
              {["male", "female"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.option,
                    form.sex === g && styles.selected,
                  ]}
                  onPress={() => setForm({ ...form, sex: g })}
                >
                  <Text
                    style={[
                      styles.optionText,
                      form.sex === g && styles.optionTextSelected,
                    ]}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );

      case "age":
        return (
          <>
            <Text style={styles.label}>How old are you?</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={form.age}
              onChangeText={(t) => setForm({ ...form, age: t })}
            />
          </>
        );

      case "weight_height":
        return (
          <>
            <Text style={styles.label}>Your body measurements</Text>
            <TextInput
              style={styles.input}
              placeholder="Weight (kg)"
              keyboardType="numeric"
              value={form.weight}
              onChangeText={(t) => setForm({ ...form, weight: t })}
            />
            <TextInput
              style={styles.input}
              placeholder="Height (cm)"
              keyboardType="numeric"
              value={form.height}
              onChangeText={(t) => setForm({ ...form, height: t })}
            />
          </>
        );

      case "medications":
        return (
          <>
            <Text style={styles.label}>Current medications</Text>
            <TextInput
              style={styles.input}
              value={form.medications}
              onChangeText={(t) =>
                setForm({ ...form, medications: t })
              }
            />
          </>
        );

      case "cardiac":
        return (
          <>
            <Text style={styles.label}>Any prior cardiac history?</Text>
            <View style={styles.row}>
              {["Yes", "No"].map((v) => {
                const val = v === "Yes";
                return (
                  <TouchableOpacity
                    key={v}
                    style={[
                      styles.option,
                      form.cardiac === val && styles.selected,
                    ]}
                    onPress={() =>
                      setForm({ ...form, cardiac: val })
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        form.cardiac === val &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {v}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        );

      case "cardiac_note":
        if (!form.cardiac) return null;
        return (
          <>
            <Text style={styles.label}>
              Describe your cardiac history
            </Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              multiline
              value={form.cardiac_note}
              onChangeText={(t) =>
                setForm({ ...form, cardiac_note: t })
              }
            />
          </>
        );

      case "sleep_start":
      case "sleep_end":
        return (
          <>
            <Text style={styles.label}>
              {currentStep === "sleep_start"
                ? "When do you usually sleep?"
                : "When do you wake up?"}
            </Text>

            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowPicker(currentStep)}
            >
              <Text>
                {form[currentStep]
                  ? form[currentStep].toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Select time"}
              </Text>
            </TouchableOpacity>

            {showPicker === currentStep && (
              <DateTimePicker
                mode="time"
                value={form[currentStep] || new Date()}
                onChange={(e, date) => {
                  setShowPicker(null);
                  if (date) {
                    setForm({
                      ...form,
                      [currentStep]: date,
                    });
                  }
                }}
              />
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.progress, { width: progressWidth }]} />

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
          <Text style={styles.title}>the health app</Text>

          <LottieView
            source={require("../assets/animations/onboarding-health.json")}
            autoPlay
            loop
            speed={0.6}
            style={[
              styles.lottie,
              keyboardOpen && styles.lottieSmall,
            ]}
          />

          {renderStep()}

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[
              styles.button,
              loading && { opacity: 0.7 },
            ]}
            onPress={
              step === steps.length - 1 ? handleRegister : next
            }
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {step === steps.length - 1
                ? "Create Account"
                : "Next"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F5" },
  progress: { height: 4, backgroundColor: "black" },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
  },
  lottie: {
    width: width * 0.7,
    height: width * 0.7,
    alignSelf: "center",
    marginBottom: 10,
  },
  lottieSmall: {
    width: width * 0.45,
    height: width * 0.45,
    marginBottom: 4,
  },
  label: { fontSize: 16, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 18,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  option: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 6,
    backgroundColor: "#fff",
  },
  selected: { backgroundColor: "black", borderColor: "black" },
  optionText: { fontSize: 16 },
  optionTextSelected: { color: "white", fontWeight: "600" },
  button: {
    backgroundColor: "black",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
});
