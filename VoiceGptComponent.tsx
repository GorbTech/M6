import React, { useState, useEffect, useCallback } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from 'react-native';
import Voice from 'react-native-voice';
import Tts from 'react-native-tts';
import axios from 'axios';
import { Mic } from 'lucide-react-native';
import { OPENAI_API_KEY } from '@env';
import { voiceStyles } from './styles';

const VoiceGptComponent: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [gptResponse, setGptResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastVoiceTime, setLastVoiceTime] = useState(Date.now());
  const SILENCE_THRESHOLD = 2000; // 2 секунды тишины

  useEffect(() => {
    let isMounted = true;
    let silenceTimer: NodeJS.Timeout | null = null;

    const setupTts = async () => {
      try {
        if (Platform.OS === 'ios') {
          await Tts.getInitStatus();
          await Tts.setDefaultLanguage('ru-RU');
          await Tts.setDefaultPitch(1.0);
        }
        
        if (isMounted) {
          const onStart = () => setIsSpeaking(true);
          const onFinish = () => setIsSpeaking(false);
          const onError = (err) => {
            console.error('TTS Error:', err);
            setIsSpeaking(false);
          };

          Tts.addEventListener('tts-start', onStart);
          Tts.addEventListener('tts-finish', onFinish);
          Tts.addEventListener('tts-error', onError);

          return () => {
            Tts.removeEventListener('tts-start', onStart);
            Tts.removeEventListener('tts-finish', onFinish);
            Tts.removeEventListener('tts-error', onError);
          };
        }
      } catch (error) {
        console.error('TTS Setup Error:', error);
      }
    };

    let cleanup = setupTts();

    Voice.onSpeechPartialResults = (e) => {
      if (e.value && isMounted) {
        setLastVoiceTime(Date.now());
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }
        silenceTimer = setTimeout(() => {
          if (isListening && isMounted) {
            Voice.stop();
            setIsListening(false);
          }
        }, SILENCE_THRESHOLD);
      }
    };

    Voice.onSpeechResults = (e) => {
      if (e.value && isMounted) {
        setRecognizedText(e.value[0]);
      }
    };

    Voice.onSpeechVolumeChanged = (e) => {
      if (e.value > 0) {
        setLastVoiceTime(Date.now());
        if (silenceTimer) {
          clearTimeout(silenceTimer);
        }
        silenceTimer = setTimeout(() => {
          if (isListening && isMounted) {
            Voice.stop();
            setIsListening(false);
          }
        }, SILENCE_THRESHOLD);
      }
    };

    Voice.onSpeechEnd = () => {
      if (isMounted && Date.now() - lastVoiceTime > SILENCE_THRESHOLD) {
        setIsListening(false);
      }
    };

    Voice.onSpeechError = (e) => {
      if (isMounted) {
        console.error('Speech Error:', e);
        setIsListening(false);
      }
    };

    return () => {
      isMounted = false;
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      cleanup && cleanup();
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, [lastVoiceTime, isListening]);

  const startListening = async () => {
    try {
      if (isListening) {
        await Voice.stop();
        setIsListening(false);
      } else {
        await Voice.start('ru-RU');
        setIsListening(true);
        setLastVoiceTime(Date.now());
      }
    } catch (e) {
      console.error('Voice Error:', e);
    }
  };

  const handleVoiceEnd = useCallback(async () => {
    if (!recognizedText || isSpeaking) return;

    try {
      setIsLoading(true);
      const { data } = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant. Respond in Russian concisely.' },
            { role: 'user', content: recognizedText },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const response = data.choices[0].message.content;
      setGptResponse(response);
      
      setTimeout(async () => {
        try {
          await Tts.speak(response);
        } catch (error) {
          console.error('TTS Speak Error:', error);
        }
      }, 100);

    } catch (error) {
      console.error('Processing Error:', error);
      Alert.alert('Ошибка', 'Не удалось обработать запрос');
    } finally {
      setIsLoading(false);
    }
  }, [recognizedText, isSpeaking]);

  useEffect(() => {
    if (recognizedText && !isListening) {
      handleVoiceEnd();
    }
  }, [recognizedText, isListening, handleVoiceEnd]);

  return (
    <View style={voiceStyles.container}>
      <TouchableOpacity
        style={[voiceStyles.micButton, isListening && voiceStyles.micButtonActive]}
        onPress={startListening}
        disabled={isLoading}
      >
        <Mic color={isListening ? '#fff' : '#000'} size={32} strokeWidth={2} />
      </TouchableOpacity>

      {recognizedText ? (
        <View style={voiceStyles.textContainer}>
          <Text style={voiceStyles.label}>Ваш запрос:</Text>
          <Text style={voiceStyles.text}>{recognizedText}</Text>
        </View>
      ) : null}

      {isLoading && <ActivityIndicator size="large" color="#007AFF" />}

      {gptResponse ? (
        <View style={voiceStyles.textContainer}>
          <Text style={voiceStyles.label}>Ответ:</Text>
          <Text style={voiceStyles.text}>{gptResponse}</Text>
        </View>
      ) : null}
    </View>
  );
};

export default VoiceGptComponent;
