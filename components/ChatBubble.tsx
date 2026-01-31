import { View, Text, StyleSheet } from "react-native";
import { Message } from "../types/chat";
import { colors } from "../theme/colors";

type Props = { message: Message };

export default function ChatBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer
      ]}
    >
      <Text style={isUser ? styles.userText : styles.aiText}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16
  },
  userContainer: {
    backgroundColor: colors.userBubble,
    alignSelf: "flex-end"
  },
  aiContainer: {
    backgroundColor: colors.aiBubble,
    alignSelf: "flex-start"
  },
  userText: { color: colors.textPrimary },
  aiText: { color: colors.textSecondary }
});
