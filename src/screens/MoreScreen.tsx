import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '../hooks/use-store';
import DottedBackground from '../components/DottedBackground';
import LogoT from '../components/LogoT';

export default function MoreScreen() {
  const { business, settings, updateBusinessDetails, updateSettings, logout } = useStore();

  // Business settings state
  const [name, setName] = useState(business?.name || '');
  const [owner, setOwner] = useState(business?.ownerName || '');
  const [address, setAddress] = useState(business?.address || '');
  const [city, setCity] = useState(business?.city || '');
  const [phone, setPhone] = useState(business?.phone || '');

  const [isEditing, setIsEditing] = useState(false);

  const handleSaveBusiness = () => {
    updateBusinessDetails({
      name,
      ownerName: owner,
      address,
      city,
      phone,
    });
    setIsEditing(false);
    alert('Atelier details updated successfully!');
  };

  const handleUnitToggle = (unit: 'inches' | 'cm') => {
    updateSettings({ measurementUnit: unit });
  };

  const handleThemeToggle = (theme: 'dark' | 'light' | 'system') => {
    updateSettings({ theme });
    alert(`Theme preference set to ${theme}.`);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <View style={styles.container}>
      <DottedBackground />

      <View style={styles.header}>
        <Text style={styles.title}>Atelier Settings</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={16} color="#FF5252" />
          <Text style={styles.logoutBtnText}>LOGOUT</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Branding header */}
        <View style={styles.brandHeader}>
          <LogoT size={60} showTicks={true} />
          <Text style={styles.brandTitle}>TAILORFLOW</Text>
          <Text style={styles.brandVersion}>v1.0.0 Premium</Text>
        </View>

        {/* Section 1: Business Profile */}
        <View style={styles.settingCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.sectionHeading}>ATELIER PROFILE</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => (isEditing ? handleSaveBusiness() : setIsEditing(true))}
            >
              <Text style={styles.editBtnText}>{isEditing ? 'SAVE' : 'EDIT'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>BUSINESS NAME</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={name}
                onChangeText={setName}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>OWNER NAME</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={owner}
                onChangeText={setOwner}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CONTACT PHONE</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={phone}
                onChangeText={setPhone}
                editable={isEditing}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>ADDRESS</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={address}
                onChangeText={setAddress}
                editable={isEditing}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>CITY</Text>
              <TextInput
                style={[styles.input, !isEditing && styles.inputDisabled]}
                value={city}
                onChangeText={setCity}
                editable={isEditing}
              />
            </View>
          </View>
        </View>

        {/* Section 2: App & Sizing Preferences */}
        <View style={styles.settingCard}>
          <Text style={styles.sectionHeading}>MEASUREMENT PREFERENCES</Text>
          
          <View style={styles.settingOptionRow}>
            <View>
              <Text style={styles.optionTitle}>Default Sizing Unit</Text>
              <Text style={styles.optionSubtitle}>Select standard unit for client dimensions.</Text>
            </View>

            <View style={styles.unitSelector}>
              <TouchableOpacity
                style={[styles.unitBtn, settings.measurementUnit === 'inches' && styles.unitBtnActive]}
                onPress={() => handleUnitToggle('inches')}
              >
                <Text style={[styles.unitBtnText, settings.measurementUnit === 'inches' && styles.unitBtnTextActive]}>
                  INCHES
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.unitBtn, settings.measurementUnit === 'cm' && styles.unitBtnActive]}
                onPress={() => handleUnitToggle('cm')}
              >
                <Text style={[styles.unitBtnText, settings.measurementUnit === 'cm' && styles.unitBtnTextActive]}>
                  CM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section 3: Visual Theme */}
        <View style={styles.settingCard}>
          <Text style={styles.sectionHeading}>VISUAL MODE</Text>
          
          <View style={styles.settingOptionRow}>
            <View>
              <Text style={styles.optionTitle}>App Color Mode</Text>
              <Text style={styles.optionSubtitle}>Choose dynamic styling preference.</Text>
            </View>
          </View>

          <View style={styles.themeSelector}>
            <TouchableOpacity
              style={[styles.themeBtn, settings.theme === 'dark' && styles.themeBtnActive]}
              onPress={() => handleThemeToggle('dark')}
            >
              <Ionicons name="moon-outline" size={16} color={settings.theme === 'dark' ? '#000' : '#8E8E93'} />
              <Text style={[styles.themeBtnText, settings.theme === 'dark' && styles.themeBtnTextActive]}>DARK</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeBtn, settings.theme === 'light' && styles.themeBtnActive]}
              onPress={() => handleThemeToggle('light')}
            >
              <Ionicons name="sunny-outline" size={16} color={settings.theme === 'light' ? '#000' : '#8E8E93'} />
              <Text style={[styles.themeBtnText, settings.theme === 'light' && styles.themeBtnTextActive]}>LIGHT</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.themeBtn, settings.theme === 'system' && styles.themeBtnActive]}
              onPress={() => handleThemeToggle('system')}
            >
              <Ionicons name="phone-portrait-outline" size={16} color={settings.theme === 'system' ? '#000' : '#8E8E93'} />
              <Text style={[styles.themeBtnText, settings.theme === 'system' && styles.themeBtnTextActive]}>SYSTEM</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer info */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>TAILORFLOW OPERATIONS SYSTEM</Text>
          <Text style={styles.footerSubtext}>POWERED BY EXPO & ZUSTAND</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '700',
    color: '#FFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: 'rgba(255, 82, 82, 0.4)',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 4,
  },
  logoutBtnText: {
    color: '#FF5252',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  brandHeader: {
    alignItems: 'center',
    marginVertical: 24,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 3,
    marginTop: 12,
  },
  brandVersion: {
    fontSize: 11,
    color: '#555558',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  settingCard: {
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 1.2,
  },
  editBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  editBtnText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  formContainer: {
    gap: 12,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1,
  },
  input: {
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    color: '#FFF',
    paddingHorizontal: 12,
    fontSize: 14,
  },
  inputDisabled: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    color: '#E5E5EA',
    paddingHorizontal: 0,
  },
  settingOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  optionSubtitle: {
    fontSize: 11,
    color: '#555558',
    marginTop: 2,
  },
  unitSelector: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 6,
    padding: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  unitBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  unitBtnActive: {
    backgroundColor: '#D4AF37',
  },
  unitBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
  },
  unitBtnTextActive: {
    color: '#000',
  },
  themeSelector: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 38,
    borderRadius: 6,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  themeBtnActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  themeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
  },
  themeBtnTextActive: {
    color: '#000',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 10,
    color: '#555558',
    letterSpacing: 2,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 8,
    color: '#333335',
    letterSpacing: 1,
    marginTop: 4,
  },
});
