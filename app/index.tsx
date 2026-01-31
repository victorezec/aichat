import { useRef, useState } from "react";
import { FlatList, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "../theme/colors";
import { Message } from "../types/chat";
import ChatBubble from "../components/ChatBubble";
import MessageInput from "../components/MessageInput";
import { sendMessageToAI } from "../services/api";

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      text: "Hi I'm your AI assistant. How can I help you today?"
    }
  ]);

  const flatListRef = useRef<FlatList>(null);

  // Handle sending message
  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", text };
    setMessages(prev => [...prev, userMessage]);

    // Show AI typing indicator
    const typingMessage: Message = { id: "typing", role: "assistant", text: "..." };
    setMessages(prev => [...prev, typingMessage]);

    try {
      // Call PHP backend -> Gemini
      const aiReply = await sendMessageToAI(text);

      // Replace typing indicator with actual AI response
      setMessages(prev =>
        prev.map(m =>
          m.id === "typing"
            ? { id: Date.now().toString(), role: "assistant", text: aiReply }
            : m
        )
      );
    } catch (err) {
      console.error(err);
      setMessages(prev =>
        prev.map(m =>
          m.id === "typing"
            ? { id: Date.now().toString(), role: "assistant", text: "Error connecting to AI." }
            : m
        )
      );
    }

    // Scroll to bottom
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.list}
        />

        <MessageInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  list: {
    padding: 16,
    paddingBottom: 8
  }
});
