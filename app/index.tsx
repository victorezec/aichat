import { useRef, useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  View,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Speech from "expo-speech";
import { MaterialIcons } from "@expo/vector-icons";

import { colors } from "../theme/colors";
import { Message } from "../types/chat";
import ChatBubble from "../components/ChatBubble";
import MessageInput from "../components/MessageInput";
import { sendMessageToAI } from "../services/api";

export default function ChatScreen() {
 const [messages, setMessages] = useState<Message[]>([]);

  const [typingDots, setTypingDots] = useState("...");
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Typing dots animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTypingDots((prev) => (prev.length < 3 ? prev + "." : "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Bubble fade-in animation
  const animateBubble = () => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true
    }).start();
  };

  // Toggle speech and stop current speech if disabling
  const handleSpeechToggle = () => {
    if (speechEnabled) {
      Speech.stop();
    }
    setSpeechEnabled(!speechEnabled);
  };

  // Send message (typed)
  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", text };
    setMessages((prev) => [...prev, userMessage]);

    const typingMessage: Message = { id: "typing", role: "assistant", text: typingDots };
    setMessages((prev) => [...prev, typingMessage]);
    flatListRef.current?.scrollToEnd({ animated: true });

    try {
      const aiReplyRaw = await sendMessageToAI(text);
      let aiText = aiReplyRaw;

      // Task execution: check for JSON tasks
      try {
        const aiJson = JSON.parse(aiReplyRaw);
        if (aiJson.type === "task" && aiJson.task === "create_note") {
          aiText = `Note created: ${aiJson.content}`;
        }
      } catch {}

      // Replace typing indicator
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "typing"
            ? { id: Date.now().toString(), role: "assistant", text: aiText }
            : m
        )
      );

      // Speak AI text
      if (speechEnabled) {
        Speech.speak(aiText);
      }

      animateBubble();
      flatListRef.current?.scrollToEnd({ animated: true });
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === "typing"
            ? { id: Date.now().toString(), role: "assistant", text: "Error connecting to AI." }
            : m
        )
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      {/* Speech Toggle Button */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleSpeechToggle}
          style={styles.toggleButton}
        >
          <MaterialIcons
            name={speechEnabled ? "volume-up" : "volume-off"}
            size={24}
            color="#22C55E"
          />
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Animated.View style={{ opacity: fadeAnim }}>
              <ChatBubble message={item} />
            </Animated.View>
          )}
          contentContainerStyle={styles.list}
        />

        {/* Message input without mic */}
        <MessageInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, paddingBottom: 8 },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  toggleButton: {
    padding: 8,
  },
});
