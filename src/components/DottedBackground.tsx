import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect, Pattern, Circle, Defs } from 'react-native-svg';

export default function DottedBackground() {
  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id="dotted-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <Circle cx="12" cy="12" r="1.2" fill="#E3D5CA" />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#dotted-grid)" />
      </Svg>
    </View>
  );
}
