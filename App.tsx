import React from 'react';
import { SafeAreaView } from 'react-native';
import VoiceGptComponent from './src/components/Voice/VoiceGptComponent';
import { globalStyles } from './src/styles/global';

const App = () => {
  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <VoiceGptComponent />
    </SafeAreaView>
  );
};

export default App;