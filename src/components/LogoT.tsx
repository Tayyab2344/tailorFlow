import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect } from 'react-native-svg';

interface LogoTProps {
  size?: number;
  showTicks?: boolean;
}

export default function LogoT({ size = 80, showTicks = true }: LogoTProps) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
        {/* Main "T" Shape - high contrast, elegant serif styling */}
        {/* Horizontal top bar */}
        <Rect x={16} y={15} width={48} height={8} rx={1} fill="#000000" />
        {/* Vertical stem */}
        <Rect x={36} y={23} width={8} height={42} rx={0.5} fill="#000000" />
        
        {/* Serif feet / decorative serifs */}
        {/* Top left serif */}
        <Path d="M16 15 L20 23 H16 Z" fill="#000000" />
        {/* Top right serif */}
        <Path d="M64 15 L60 23 H64 Z" fill="#000000" />
        {/* Bottom serif base */}
        <Rect x={30} y={63} width={20} height={2} rx={0.5} fill="#000000" />
        <Path d="M30 65 L36 63 H44 L50 65 Z" fill="#000000" />

        {/* Measuring tape tick marks or tailors stitch marks through the center stem */}
        {showTicks && (
          <>
            <Path d="M31 40 H49" stroke="#999" strokeWidth="1.5" />
            <Path d="M34 43 H46" stroke="#999" strokeWidth="1.5" />
            <Path d="M34 37 H46" stroke="#999" strokeWidth="1.5" />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
