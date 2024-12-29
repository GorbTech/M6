import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import Tts from "react-native-tts";
import axios from "axios";
import { OPENAI_API_KEY } from "@env";
import { voiceStyles } from "./styles";

const GptTtsComponent = () => {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const makeGptRequest = async (queryText) => {
    if (!OPENAI_API_KEY) {
      throw new Error("API ключ не установлен");
    }

    const { data } = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Respond in Russian, concisely and to the point."
          },
          { role: "user", content: queryText }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY.trim()}`,
          "Content-Type": "application/json",
        }
      }
    );

    return data.choices[0].message.content;
  };

  const handleSubmit = async () => {
    if (!query.trim()) {
      setResponse("Пожалуйста, введите запрос");
      return;
    }

    setIsLoading(true);
    try {
      const gptResponse = await makeGptRequest(query);
      setResponse(gptResponse);
      await Tts.stop();
      await Tts.speak(gptResponse);
    } catch (error) {
      console.error("Error:", error);
      setResponse(`Ошибка: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={voiceStyles.container}>
      <TextInput
        style={voiceStyles.input}
        value={query}
        onChangeText={setQuery}
        placeholder="Введите запрос для GPT"
        multiline
        editable={!isLoading}
      />
      <Button
        title={isLoading ? "Загрузка..." : "Получить ответ"}
        onPress={handleSubmit}
        disabled={isLoading}
      />
      {response && (
        <View style={voiceStyles.responseContainer}>
          <Text style={voiceStyles.responseText}>{response}</Text>
        </View>
      )}
    </View>
  );
};

export default GptTtsComponent;
