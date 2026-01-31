import { View, Text, StyleSheet } from "react-native";
import { Message } from "../types/chat";
import { colors } from "../theme/colors";

export default function ChatBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <View style={[
      styles.bubble,
      isUser ? styles.user : styles.ai
    ]}>
      <Text style={styles.text}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12
  },
  user: {
    backgroundColor: colors.userBubble,
    alignSelf: "flex-end"
  },
  ai: {
    backgroundColor: colors.aiBubble,
    alignSelf: "flex-start"
  },
  text: {
    color: colors.textPrimary,
    fontSize: 16
  }
});
