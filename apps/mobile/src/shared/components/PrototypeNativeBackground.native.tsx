import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

const BASE_TOP = '#091411';
const BASE_UPPER = '#07120F';
const BASE_MID = '#060B0A';
const BASE_BOTTOM = '#030605';

export function PrototypeNativeBackground() {
  const isExpoGo = Constants.appOwnership === 'expo';

  if (isExpoGo) {
    return <View pointerEvents="none" style={styles.fallback} testID="prototype-native-ambient-backdrop" />;
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} testID="prototype-native-ambient-backdrop">
      <LinearGradient
        colors={[BASE_TOP, BASE_UPPER, BASE_MID, BASE_BOTTOM]}
        locations={[0, 0.32, 0.68, 1]}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(37, 255, 219, 0.095)', 'rgba(37, 255, 219, 0.035)', 'rgba(37, 255, 219, 0)']}
        locations={[0, 0.42, 1]}
        style={styles.topGlow}
      />
      <LinearGradient
        colors={['rgba(120, 255, 175, 0)', 'rgba(120, 255, 175, 0.018)', 'rgba(120, 255, 175, 0.035)']}
        locations={[0, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: BASE_MID,
  },
  topGlow: {
    height: 340,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
});
