import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type Props = {
  onSend: (text: string) => void;
};

export default function MessageInput({ onSend }: Props) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Type a message"
        value={text}
        onChangeText={setText}
      />
      <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
        <MaterialIcons name="send" size={20} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 12,
    alignItems: "center",
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.card,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.card,
    color: colors.textPrimary,
  },
  sendButton: {
    marginLeft: 12,
    backgroundColor: colors.accent,
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});
