import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  UIManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import LottieView from "lottie-react-native";

import { useAuth } from "../context/AuthContext";
import { updateUser, deleteUser } from "../utils/api";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}


const parseDate = (val) => {
  if (!val) return null;
  try {
    const iso = val.includes("Z") ? val : val.split("+")[0] + "Z";
    const d = new Date(iso);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const formatTime = (date) => {
  if (!date) return "Not set";
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
};

const isInvalidSleep = (start, end) => {
  if (!start || !end) return false;
  return (
    start.getHours() === end.getHours() &&
    start.getMinutes() === end.getMinutes()
  );
};


export default function ProfileScreen() {
  const { user, setUser, logout } = useAuth();

  const [edit, setEdit] = useState(false);

  const [profileOpen, setProfileOpen] = useState(true);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [healthOpen, setHealthOpen] = useState(false);

  const [name, setName] = useState("");
  const [sleepStart, setSleepStart] = useState(null);
  const [sleepEnd, setSleepEnd] = useState(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const [priorCardiac, setPriorCardiac] = useState(false);
  const [cardiacNote, setCardiacNote] = useState("");
  const [medications, setMedications] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");

  useEffect(() => {
    if (!user) return;

    setName(user.name || "");
    setSleepStart(parseDate(user.sleep_start));
    setSleepEnd(parseDate(user.sleep_end));

    const h = user.health || {};
    setPriorCardiac(!!h.prior_cardiac_history);
    setCardiacNote(h.cardiac_history_note || "");
    setMedications(h.medications || "");
    setAge(h.age?.toString() || "");
    setSex(h.sex || "");
    setWeight(h.weight?.toString() || "");
    setHeight(h.height?.toString() || "");
  }, [user]);

  const toggle = (setter) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter((v) => !v);
  };

  const saveProfile = async () => {
    if (isInvalidSleep(sleepStart, sleepEnd)) {
      Alert.alert("Invalid Sleep Schedule", "Sleep duration cannot be zero.");
      return;
    }

    try {
      const payload = {
        name,
        sleep_start: sleepStart ? sleepStart.toISOString() : null,
        sleep_end: sleepEnd ? sleepEnd.toISOString() : null,
        health: {
          prior_cardiac_history: priorCardiac,
          cardiac_history_note: cardiacNote || null,
          medications,
          age: Number(age),
          sex,
          weight: Number(weight),
          height: Number(height),
        },
      };

      await updateUser(payload);
      setUser({ ...user, ...payload });
      setEdit(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch {
      Alert.alert("Update Failed", "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.content}>

          <ExpandableCard
            title="Profile"
            open={profileOpen}
            onToggle={() => toggle(setProfileOpen)}
            animation={require("../assets/animations/profile-avatar.json")}
          >
            <Text style={styles.name}>{name || "Your Name"}</Text>
            <Text style={styles.email}>{user?.email}</Text>

            <TouchableOpacity style={styles.editBtn} onPress={() => setEdit(!edit)}>
              <Text style={styles.editText}>{edit ? "Cancel" : "Edit Profile"}</Text>
            </TouchableOpacity>
          </ExpandableCard>

          <ExpandableCard
            title="Sleep Schedule"
            open={sleepOpen}
            onToggle={() => toggle(setSleepOpen)}
            animation={require("../assets/animations/sleep.json")}
          >
            <Row label="Sleep Start">
              <TouchableOpacity disabled={!edit} onPress={() => setShowStartPicker(true)}>
                <Text style={styles.value}>{formatTime(sleepStart)}</Text>
              </TouchableOpacity>
            </Row>

            <Row label="Sleep End">
              <TouchableOpacity disabled={!edit} onPress={() => setShowEndPicker(true)}>
                <Text style={styles.value}>{formatTime(sleepEnd)}</Text>
              </TouchableOpacity>
            </Row>
          </ExpandableCard>

          <ExpandableCard
            title="Health Details"
            open={healthOpen}
            onToggle={() => toggle(setHealthOpen)}
            animation={require("../assets/animations/health.json")}
          >
            <Row label="Prior Cardiac History">
              <Switch value={priorCardiac} onValueChange={setPriorCardiac} disabled={!edit} />
            </Row>

            {priorCardiac && edit && (
              <Input label="Cardiac History Note" value={cardiacNote} onChange={setCardiacNote} />
            )}

            <Input label="Medications" value={medications} onChange={setMedications} editable={edit} />
            <Input label="Age" value={age} onChange={setAge} keyboardType="numeric" editable={edit} />
            <Input label="Sex" value={sex} onChange={setSex} editable={edit} />
            <Input label="Weight (kg)" value={weight} onChange={setWeight} keyboardType="numeric" editable={edit} />
            <Input label="Height (cm)" value={height} onChange={setHeight} keyboardType="numeric" editable={edit} />
          </ExpandableCard>

          {edit && (
            <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
              <Text style={styles.saveText}>Save Changes</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() =>
              Alert.alert("Delete Account", "This action is permanent.", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: async () => {
                  await deleteUser();
                  await logout();
                }},
              ])
            }
          >
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        isVisible={showStartPicker}
        mode="time"
        onConfirm={(d) => { setSleepStart(d); setShowStartPicker(false); }}
        onCancel={() => setShowStartPicker(false)}
      />

      <DateTimePickerModal
        isVisible={showEndPicker}
        mode="time"
        onConfirm={(d) => { setSleepEnd(d); setShowEndPicker(false); }}
        onCancel={() => setShowEndPicker(false)}
      />
    </SafeAreaView>
  );
}

const ExpandableCard = ({ title, open, onToggle, animation, children }) => (
  <View style={styles.card}>
    <TouchableOpacity style={styles.cardHeader} onPress={onToggle} activeOpacity={0.8}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <LottieView source={animation} autoPlay loop style={styles.sectionLottie} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Ionicons name={open ? "chevron-up" : "chevron-down"} size={22} />
    </TouchableOpacity>
    {open && <View style={{ marginTop: 10 }}>{children}</View>}
  </View>
);

const Input = ({ label, value, onChange, editable = true, ...props }) => (
  <>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, !editable && styles.disabled]}
      value={value}
      onChangeText={onChange}
      editable={editable}
      {...props}
    />
  </>
);

const Row = ({ label, children }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F5" },
  content: { padding: 20 },

  card: {
    backgroundColor: "#efede5ff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: { fontSize: 18, fontWeight: "700", marginLeft: 10 },
  sectionLottie: { width: 100, height: 100 },

  name: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  email: { color: "#666", textAlign: "center", marginBottom: 10 },

  editBtn: { borderWidth: 1, borderRadius: 12, padding: 8, alignSelf: "center" },
  editText: { fontWeight: "600" },

  label: { fontWeight: "600" },
  value: { fontSize: 16 },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
  },

  disabled: { backgroundColor: "#f0f0f0" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  saveBtn: {
    backgroundColor: "#000",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 16,
  },

  saveText: { color: "#fff", fontWeight: "700" },

  logoutBtn: {
    borderWidth: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 14,
  },

  logoutText: { fontWeight: "600" },

  deleteBtn: {
    backgroundColor: "#FFE5E5",
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  deleteText: { color: "#B00020", fontWeight: "700" },
});
