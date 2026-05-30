import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DottedBackground from '../components/DottedBackground';
import LogoT from '../components/LogoT';

import { useStore } from '../hooks/use-store';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

const CATEGORIES = ['Bespoke', 'Ready-to-Wear', 'Haute Couture', 'Made-to-Measure', 'Bridalwear'];
const CURRENCIES = ['USD ($)', 'EUR (€)', 'GBP (£)', 'CAD ($)', 'AUD ($)', 'JPY (¥)'];

export default function RegisterScreen({ onNavigateToLogin }: RegisterScreenProps) {
  const registerBusiness = useStore((state) => state.registerBusiness);
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [category, setCategory] = useState('Bespoke');
  const [currency, setCurrency] = useState('USD ($)');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');

  // Dropdown States
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  // Field Focus States
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleContinue = () => {
    if (!businessName || !ownerName || !phone) {
      alert('Please fill in the required fields: Business Name, Owner Name, and Phone Number.');
      return;
    }
    registerBusiness({
      name: businessName,
      ownerName: ownerName,
      category,
      currency,
      phone,
      address,
      city,
    });
    alert(`Atelier "${businessName}" registered successfully! Welcome to TailorFlow.`);
  };


  const renderDropdownItem = (item: string, type: 'category' | 'currency') => {
    const isSelected = type === 'category' ? category === item : currency === item;
    return (
      <TouchableOpacity
        style={[styles.modalItem, isSelected && styles.modalItemSelected]}
        onPress={() => {
          if (type === 'category') {
            setCategory(item);
            setCategoryModalVisible(false);
          } else {
            setCurrency(item);
            setCurrencyModalVisible(false);
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}>
          {item}
        </Text>
        {isSelected && <Ionicons name="checkmark" size={20} color="#000" />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <DottedBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Top Header Bar & Progress */}
        <View style={styles.headerBar}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onNavigateToLogin} activeOpacity={0.7} style={styles.logoPressable}>
              <LogoT size={24} showTicks={false} />
            </TouchableOpacity>
            <Text style={styles.stepText}>STEP 1 OF 3</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarActive} />
            <View style={styles.progressBarInactive} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Register Your Atelier</Text>
            <Text style={styles.subtitle}>{"Let's set up your digital workspace."}</Text>
          </View>

          {/* Form Fields */}
          <View style={styles.form}>
            {/* Business Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>BUSINESS NAME</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'businessName' && styles.inputFocused
                ]}
                placeholder="e.g. Savile & Row"
                placeholderTextColor="#999"
                value={businessName}
                onChangeText={setBusinessName}
                onFocus={() => setFocusedField('businessName')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Owner Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>OWNER NAME</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'ownerName' && styles.inputFocused
                ]}
                placeholder="Full Name"
                placeholderTextColor="#999"
                value={ownerName}
                onChangeText={setOwnerName}
                onFocus={() => setFocusedField('ownerName')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* Shop Logo upload */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>SHOP LOGO</Text>
              <TouchableOpacity style={styles.uploadBox} activeOpacity={0.8}>
                <Ionicons name="arrow-up-outline" size={24} color="#666" style={styles.uploadIcon} />
                <Text style={styles.uploadText}>Upload your brand mark</Text>
              </TouchableOpacity>
            </View>

            {/* Business Category Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>BUSINESS CATEGORY</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setCategoryModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownValue}>{category}</Text>
                <Ionicons name="chevron-down" size={18} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Currency Dropdown */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CURRENCY</Text>
              <TouchableOpacity
                style={styles.dropdownTrigger}
                onPress={() => setCurrencyModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.dropdownValue}>{currency}</Text>
                <Ionicons name="chevron-down" size={18} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Phone Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <View style={[
                styles.phoneInputContainer,
                focusedField === 'phone' && styles.phoneInputContainerFocused
              ]}>
                <Text style={styles.countryCode}>+1</Text>
                <View style={styles.phoneDivider} />
                <TextInput
                  style={styles.phoneInput}
                  placeholder="(555) 000-0000"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>ADDRESS</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'address' && styles.inputFocused
                ]}
                placeholder="Studio address"
                placeholderTextColor="#999"
                value={address}
                onChangeText={setAddress}
                onFocus={() => setFocusedField('address')}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            {/* City */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>CITY</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'city' && styles.inputFocused
                ]}
                placeholder="London"
                placeholderTextColor="#999"
                value={city}
                onChangeText={setCity}
                onFocus={() => setFocusedField('city')}
                onBlur={() => setFocusedField(null)}
                onSubmitEditing={handleContinue}
              />
            </View>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.9}
          >
            <Text style={styles.continueButtonText}>CONTINUE TO MEASUREMENTS</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Selection Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Business Category</Text>
              <TouchableOpacity onPress={() => setCategoryModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => renderDropdownItem(item, 'category')}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>

      {/* Currency Selection Modal */}
      <Modal
        visible={currencyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCurrencyModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Currency</Text>
              <TouchableOpacity onPress={() => setCurrencyModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => renderDropdownItem(item, 'currency')}
              contentContainerStyle={styles.modalList}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF6F3',
  },
  keyboardView: {
    flex: 1,
  },
  headerBar: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    backgroundColor: '#FAF6F3',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E1DA',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 12,
  },
  logoPressable: {
    paddingVertical: 4,
    paddingRight: 16,
  },
  stepText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 1,
  },
  progressBarContainer: {
    flexDirection: 'row',
    height: 3,
    width: '100%',
    backgroundColor: '#E8E1DA',
  },
  progressBarActive: {
    width: '33.3%',
    height: '100%',
    backgroundColor: '#000000',
  },
  progressBarInactive: {
    width: '66.7%',
    height: '100%',
    backgroundColor: '#E8E1DA',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  titleContainer: {
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-light',
  },
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#444444',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D4C8BE',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  inputFocused: {
    borderColor: '#000000',
  },
  uploadBox: {
    height: 110,
    borderWidth: 1,
    borderColor: '#C7BBAE',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 13,
    color: '#555555',
  },
  dropdownTrigger: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D4C8BE',
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dropdownValue: {
    fontSize: 15,
    color: '#333333',
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#D4C8BE',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  phoneInputContainerFocused: {
    borderColor: '#000000',
  },
  countryCode: {
    fontSize: 15,
    color: '#666666',
    marginRight: 12,
  },
  phoneDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#D4C8BE',
    marginRight: 12,
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#333333',
  },
  continueButton: {
    backgroundColor: '#000000',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E1DA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
  },
  modalList: {
    paddingVertical: 12,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  modalItemSelected: {
    backgroundColor: '#FAF6F3',
  },
  modalItemText: {
    fontSize: 15,
    color: '#444444',
  },
  modalItemTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
});
