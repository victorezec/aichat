import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { colors } from "../theme/colors";

export default function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState("");

  return (
    <View style={styles.container}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Ask me anything..."
        placeholderTextColor={colors.textSecondary}
        style={styles.input}
      />
      <TouchableOpacity
        onPress={() => {
          if (!text.trim()) return;
          onSend(text);
          setText("");
        }}
        style={styles.send}
      >
        <Text style={styles.sendText}>➤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#1E293B",
    backgroundColor: colors.card
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 16
  },
  send: {
    marginLeft: 12,
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: "center"
  },
  sendText: {
    color: "#000",
    fontSize: 18
  }
});
