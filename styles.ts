import { StyleSheet, Platform } from 'react-native';
import { theme } from '../../styles/theme';

export const voiceStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: theme.spacing.medium,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.medium,
    padding: theme.spacing.medium,
    minHeight: 100,
    backgroundColor: theme.colors.background,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.button.inactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  micButtonActive: {
    backgroundColor: theme.colors.button.active,
  },
  textContainer: {
    width: '100%',
    marginVertical: theme.spacing.small,
    padding: theme.spacing.medium,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.medium,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
      },
      android: {        elevation: 2,
      },
    }),
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
  responseContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    width: "100%",
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
});
