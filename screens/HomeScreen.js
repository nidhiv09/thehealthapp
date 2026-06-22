import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native";

import { useAuth } from "../context/AuthContext";
import {
  generateDailySummary,
  getWeeklySummary,
  getWeeklyLLMReport,
} from "../utils/api";


const formatFloat = (value) => {
  if (value === null || value === undefined || isNaN(value)) return "—";
  return Number(value).toFixed(2);
};

const BulletList = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return <Text style={styles.muted}>No data available.</Text>;
  }

  return items.map((item, index) => (
    <Text key={index} style={styles.bullet}>• {item}</Text>
  ));
};


export default function HomeScreen({ navigation }) {
  const { user } = useAuth();

  const [daily, setDaily] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [llm, setLlm] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showDailyDetails, setShowDailyDetails] = useState(false);
  const [showWeeklyDetails, setShowWeeklyDetails] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);

      const dailyRes = await generateDailySummary();
      setDaily(dailyRes);

      const weeklyRes = await getWeeklySummary();
      setWeekly(weeklyRes);

      try {
        const llmRes = await getWeeklyLLMReport();
        setLlm(llmRes);
      } catch {
        setLlm(null);
      }
    } catch (err) {
      console.log("Home fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Hi{user?.name ? `, ${user.name}` : ""}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Ionicons name="person-circle-outline" size={34} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {loading ? (
          <View style={styles.center}>
            <LottieView
              source={require("../assets/animations/loading-health.json")}
              autoPlay
              loop
              style={styles.loadingLottie}
            />
            <Text style={styles.text}>Loading your health summary…</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.card}
              onPress={() => setShowDailyDetails(!showDailyDetails)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Daily Summary</Text>
                <Ionicons
                  name={showDailyDetails ? "chevron-up" : "chevron-down"}
                  size={22}
                />
              </View>

              <LottieView
                source={require("../assets/animations/heart-pulse.json")}
                autoPlay
                loop
                style={styles.inlineLottie}
              />

              <Text style={styles.metric}>
                Average HR:{" "}
                <Text style={styles.metricValue}>
                  {formatFloat(daily?.avg_hr)} bpm
                </Text>
              </Text>

              <Text style={styles.metric}>
                Resting HR:{" "}
                <Text style={styles.metricValue}>
                  {formatFloat(daily?.rest_hr)} bpm
                </Text>
              </Text>

              {showDailyDetails && (
                <>
                  <View style={styles.divider} />
                  <Text style={styles.text}>
                    {daily?.summary || "No detailed daily summary available."}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.card}
              onPress={() => setShowWeeklyDetails(!showWeeklyDetails)}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.sectionTitle}>Weekly Insights</Text>
                <Ionicons
                  name={showWeeklyDetails ? "chevron-up" : "chevron-down"}
                  size={22}
                />
              </View>

              {llm?.report && (
                <LottieView
                  source={require("../assets/animations/analytics-ai.json")}
                  autoPlay
                  loop
                  style={styles.inlineLottie}
                />
              )}

              <Text style={styles.text}>
                {llm?.report?.weekly_health_summary ||
                  "Weekly insights will be available once sufficient data is collected."}
              </Text>

              {showWeeklyDetails && llm?.report && (
                <>
                  <View style={styles.divider} />

                  <Text style={styles.subTitle}>ECG Pattern Insights</Text>
                  <Text style={styles.text}>{llm.report.ecg_pattern_insights}</Text>

                  <Text style={styles.subTitle}>Heart Rate Patterns</Text>
                  <Text style={styles.text}>
                    {llm.report.heart_rate_pattern_insights}
                  </Text>

                  <Text style={styles.subTitle}>Possible Risk Indicators</Text>
                  <BulletList items={llm.report.possible_risk_indicators} />

                  <Text style={styles.subTitle}>Lifestyle Recommendations</Text>
                  <BulletList items={llm.report.lifestyle_recommendations} />

                  <Text style={styles.subTitle}>Diet Recommendations</Text>
                  <BulletList items={llm.report.diet_recommendations} />

                  <Text style={styles.subTitle}>
                    When to Consider Medical Attention
                  </Text>
                  <Text style={styles.text}>
                    {llm.report.medical_attention_advice}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF9F5" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
  },

  title: { fontSize: 22, fontWeight: "700", color: "#000" },

  content: { padding: 20, paddingBottom: 40 },

  card: {
    backgroundColor: "#efede5ff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    padding: 20,
    marginBottom: 20,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 6 },

  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 14,
    marginBottom: 6,
  },

  text: { fontSize: 15, lineHeight: 22, color: "#000" },

  metric: { fontSize: 14, color: "#333", marginBottom: 4 },

  metricValue: { fontWeight: "700", color: "#000" },

  bullet: { fontSize: 15, lineHeight: 22 },

  muted: { fontSize: 15, color: "#666", fontStyle: "italic" },

  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 12,
  },

  center: { alignItems: "center", marginTop: 80 },

  loadingLottie: { width: 180, height: 180 },

  inlineLottie: {
    width: 120,
    height: 120,
    alignSelf: "center",
    marginVertical: 10,
  },
});
