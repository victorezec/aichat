export async function sendMessageToAI(message: string) {
  try {
    const res = await fetch("https://domain.com/chat.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    return data.message;
  } catch (err) {
    console.error(err);
    return "Error connecting to AI";
  }
}
