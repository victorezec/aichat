import { useRef, useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  View,
  TouchableOpacity,
  Text,
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
  const [scrolledDown, setScrolledDown] = useState(false);
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

  // Handle scroll to show/hide scroll to top button
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    setScrolledDown(scrollPosition > 300);
  };

  // Scroll to top
  const scrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
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
        <Text style={styles.aiName}>VEC-AI</Text>
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
          onScroll={handleScroll}
          scrollEventThrottle={16}
        />

        {/* Message input without mic */}
        <MessageInput onSend={handleSend} />

        {/* Scroll to Top Button */}
        {scrolledDown && (
          <TouchableOpacity
            onPress={scrollToTop}
            style={styles.scrollToTopButton}
          >
            <MaterialIcons name="arrow-upward" size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: 16, paddingBottom: 8 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.card,
  },
  aiName: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.accent,
  },
  toggleButton: {
    padding: 8,
  },
  scrollToTopButton: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    backgroundColor: colors.accent,
    borderRadius: 50,
    padding: 8,
    opacity: 0.3,
  },
});
