import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import Tts from 'react-native-tts';
import { NativeModules } from 'react-native';
import { voiceStyles } from './styles';

const TextToSpeechComponent = () => {
  const [textToSpeak, setTextToSpeak] = useState('');
  const [availableVoices, setAvailableVoices] = useState([]);

  useEffect(() => {
    const setupTts = async () => {
      if (NativeModules.TextToSpeech) {
        try {
          console.log('Инициализация TTS...');
          Tts.removeAllListeners();

          await Tts.setDefaultLanguage('ru-RU');
          await Tts.setDefaultRate(0.5);
          await Tts.setDefaultPitch(1.0);

          const voices = await Tts.voices();
          console.log('Доступные голоса:', voices);

          const filteredVoices = voices.filter((voice) => voice.id);
          setAvailableVoices(filteredVoices);

          if (filteredVoices.length > 0) {
            await Tts.setDefaultVoice(filteredVoices[0].id);
          }
        } catch (error) {
          console.error('Ошибка при настройке TTS:', error);
        }
      } else {
        console.error('Модуль TTS отсутствует');
        Alert.alert('Ошибка', 'Модуль TextToSpeech не найден.');
      }
    };

    setupTts();

    return () => {
      if (NativeModules.TextToSpeech) {
        Tts.removeAllListeners();
      }
    };
  }, []);

  const speakText = () => {
    if (textToSpeak) {
      try {
        Tts.speak(textToSpeak);
      } catch (error) {
        console.error('Ошибка при воспроизведении текста:', error);
      }
    } else {
      Alert.alert('Ошибка', 'Введите текст для озвучивания.');
    }
  };

  return (
    <View style={voiceStyles.container}>
      <TextInput
        style={voiceStyles.input}
        value={textToSpeak}
        onChangeText={setTextToSpeak}
        placeholder="Введите текст для озвучивания"
      />
      <Button title="Воспроизвести" onPress={speakText} />
    </View>
  );
};

export default TextToSpeechComponent;
