import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import Voice from 'react-native-voice';

const SpeechToTextComponent = () => {
  const [recognized, setRecognized] = useState('');

  useEffect(() => {
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        setRecognized(e.value[0]);
      }
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = async () => {
    try {
      await Voice.start('ru-RU');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View>
      <Button title="Начать распознавание" onPress={startListening} />
      <Text>Распознанный текст: {recognized}</Text>
    </View>
  );
};

export default SpeechToTextComponent;
