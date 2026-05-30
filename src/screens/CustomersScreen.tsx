import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, Customer } from '../hooks/use-store';
import DottedBackground from '../components/DottedBackground';

const MALE_TEMPLATES = ['Suit', 'Kurta', 'Waistcoat', 'Shalwar Kameez'];
const FEMALE_TEMPLATES = ['Lehenga', 'Abaya', 'Frock', 'Suit'];

const DEFAULT_MEASUREMENT_FIELDS = [
  'Neck',
  'Chest',
  'Waist',
  'Hips',
  'Sleeve',
  'Shoulder',
  'ShirtLength',
  'TrouserLength',
];

export default function CustomersScreen() {
  const {
    customers,
    measurements,
    orders,
    payments,
    addCustomer,
    updateCustomer,
    saveMeasurements,
    business,
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenderFilter, setSelectedGenderFilter] = useState<'All' | 'Male' | 'Female'>('All');
  const [vipFilter, setVipFilter] = useState(false);

  // Modals Visibility
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Profile View Sub-Tab
  const [profileTab, setProfileTab] = useState<'details' | 'measurements' | 'orders' | 'payments'>('details');

  // Form State: New Customer
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustGender, setNewCustGender] = useState<'Male' | 'Female'>('Male');
  const [newCustNotes, setNewCustNotes] = useState('');
  const [newCustVip, setNewCustVip] = useState(false);

  // Measurements Editor State
  const [activeTemplate, setActiveTemplate] = useState<string>('Suit');
  const [measurementValues, setMeasurementValues] = useState<Record<string, string>>({});
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFields, setCustomFields] = useState<string[]>([]);

  // Filter & Search Customers
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGender = selectedGenderFilter === 'All' || c.gender === selectedGenderFilter;
    const matchesVip = !vipFilter || c.vip;

    return matchesSearch && matchesGender && matchesVip;
  });

  const handleOpenProfile = (cust: Customer) => {
    setSelectedCustomer(cust);
    setProfileTab('details');
    
    // Load existing measurements
    const custMeasurements = measurements[cust.id] || [];
    // Set active template as first available, or default
    const existing = custMeasurements[0];
    if (existing) {
      setActiveTemplate(existing.templateName);
      const strValues: Record<string, string> = {};
      Object.entries(existing.values).forEach(([k, v]) => {
        strValues[k] = String(v);
      });
      setMeasurementValues(strValues);
      
      // Determine if there are custom fields
      const customOnes = Object.keys(existing.values).filter(
        (k) => !DEFAULT_MEASUREMENT_FIELDS.includes(k)
      );
      setCustomFields(customOnes);
    } else {
      // Default initial templates based on gender
      const defaultTemp = cust.gender === 'Male' ? 'Suit' : 'Lehenga';
      setActiveTemplate(defaultTemp);
      
      // Fill empty values
      const initialVals: Record<string, string> = {};
      DEFAULT_MEASUREMENT_FIELDS.forEach((f) => {
        initialVals[f] = '';
      });
      setMeasurementValues(initialVals);
      setCustomFields([]);
    }
    
    setProfileModalVisible(true);
  };

  const handleCreateCustomer = () => {
    if (!newCustName || !newCustPhone) {
      alert('Please fill out Name and Phone number.');
      return;
    }
    const added = addCustomer({
      name: newCustName,
      phone: newCustPhone,
      email: newCustEmail,
      gender: newCustGender,
      notes: newCustNotes || undefined,
      vip: newCustVip,
    });

    // Reset Form
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustGender('Male');
    setNewCustNotes('');
    setNewCustVip(false);
    setCreateModalVisible(false);

    alert(`Customer ${added.name} registered successfully!`);
  };

  const handleTemplateChange = (template: string) => {
    setActiveTemplate(template);
    if (!selectedCustomer) return;
    
    // See if measurements already exist for this customer + template
    const custMeasurements = measurements[selectedCustomer.id] || [];
    const match = custMeasurements.find((m) => m.templateName === template);
    
    if (match) {
      const strValues: Record<string, string> = {};
      Object.entries(match.values).forEach(([k, v]) => {
        strValues[k] = String(v);
      });
      setMeasurementValues(strValues);
      
      const customOnes = Object.keys(match.values).filter(
        (k) => !DEFAULT_MEASUREMENT_FIELDS.includes(k)
      );
      setCustomFields(customOnes);
    } else {
      // Create empty record for this template
      const initialVals: Record<string, string> = {};
      DEFAULT_MEASUREMENT_FIELDS.forEach((f) => {
        initialVals[f] = '';
      });
      setMeasurementValues(initialVals);
      setCustomFields([]);
    }
  };

  const handleAddCustomField = () => {
    if (!customFieldName.trim()) return;
    const formatted = customFieldName.trim();
    if (measurementValues[formatted] !== undefined) {
      alert('Field already exists.');
      return;
    }
    setCustomFields([...customFields, formatted]);
    setMeasurementValues({
      ...measurementValues,
      [formatted]: '',
    });
    setCustomFieldName('');
  };

  const handleSaveMeasurements = () => {
    if (!selectedCustomer) return;
    
    // Convert string inputs to numbers where possible
    const valuesToSave: Record<string, number | string> = {};
    Object.entries(measurementValues).forEach(([k, v]) => {
      const num = parseFloat(v);
      valuesToSave[k] = isNaN(num) ? v : num;
    });

    saveMeasurements(selectedCustomer.id, activeTemplate, valuesToSave);
    alert('Measurements saved successfully!');
  };

  // Get current customer history
  const getCustomerOrders = () => {
    if (!selectedCustomer) return [];
    return orders.filter((o) => o.customerId === selectedCustomer.id);
  };

  const getCustomerPayments = () => {
    if (!selectedCustomer) return [];
    return payments.filter((p) => {
      const order = orders.find((o) => o.id === p.orderId);
      return order?.customerId === selectedCustomer.id;
    });
  };

  const currentOrders = getCustomerOrders();
  const currentPayments = getCustomerPayments();

  const formatCurrency = (amount: number) => {
    const symbol = business?.currency.split(' ')[0] || '$';
    return `${symbol}${amount}`;
  };

  return (
    <View style={styles.container}>
      <DottedBackground />

      <View style={styles.header}>
        <Text style={styles.title}>Atelier Customers</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add" size={18} color="#000" />
          <Text style={styles.createButtonText}>ADD CLIENT</Text>
        </TouchableOpacity>
      </View>

      {/* Filters & Search */}
      <View style={styles.filterSection}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by client name, email or phone..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.tagRow}>
          <TouchableOpacity
            style={[styles.genderTag, selectedGenderFilter === 'All' && styles.genderTagActive]}
            onPress={() => setSelectedGenderFilter('All')}
          >
            <Text style={[styles.genderTagText, selectedGenderFilter === 'All' && styles.genderTagTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderTag, selectedGenderFilter === 'Male' && styles.genderTagActive]}
            onPress={() => setSelectedGenderFilter('Male')}
          >
            <Text style={[styles.genderTagText, selectedGenderFilter === 'Male' && styles.genderTagTextActive]}>
              Gentlemen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderTag, selectedGenderFilter === 'Female' && styles.genderTagActive]}
            onPress={() => setSelectedGenderFilter('Female')}
          >
            <Text style={[styles.genderTagText, selectedGenderFilter === 'Female' && styles.genderTagTextActive]}>
              Ladies
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.vipToggle, vipFilter && styles.vipToggleActive]}
            onPress={() => setVipFilter(!vipFilter)}
            activeOpacity={0.8}
          >
            <Ionicons name="star" size={14} color={vipFilter ? '#000' : '#D4AF37'} />
            <Text style={[styles.vipToggleText, vipFilter && styles.vipToggleTextActive]}>VIP</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Customer List */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.customerCard}
            onPress={() => handleOpenProfile(item)}
            activeOpacity={0.9}
          >
            <View style={styles.cardInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.clientName}>{item.name}</Text>
                {item.vip && <Ionicons name="star" size={14} color="#D4AF37" style={styles.vipStar} />}
              </View>
              <Text style={styles.clientPhone}>{item.phone}</Text>
              {item.email && <Text style={styles.clientEmail}>{item.email}</Text>}
            </View>

            <View style={styles.cardActions}>
              <View style={[styles.genderIndicator, item.gender === 'Male' ? styles.indicatorMale : styles.indicatorFemale]}>
                <Text style={styles.genderText}>{item.gender.toUpperCase()}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D4AF37" />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#333" />
            <Text style={styles.emptyTitle}>No Clients Found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting filters or add a new client profile.</Text>
          </View>
        }
      />

      {/* CREATE CUSTOMER MODAL */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Customer Profile</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.form}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CLIENT FULL NAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="James Sterling"
                    placeholderTextColor="#555"
                    value={newCustName}
                    onChangeText={setNewCustName}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PHONE NUMBER</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor="#555"
                    keyboardType="phone-pad"
                    value={newCustPhone}
                    onChangeText={setNewCustPhone}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="james@sterling.com"
                    placeholderTextColor="#555"
                    keyboardType="email-address"
                    value={newCustEmail}
                    onChangeText={setNewCustEmail}
                  />
                </View>

                {/* Gender Select */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>GENDER CATEGORY</Text>
                  <View style={styles.genderSelectorRow}>
                    <TouchableOpacity
                      style={[styles.genderButton, newCustGender === 'Male' && styles.genderButtonActive]}
                      onPress={() => setNewCustGender('Male')}
                    >
                      <Ionicons name="male-outline" size={16} color={newCustGender === 'Male' ? '#000' : '#8E8E93'} />
                      <Text style={[styles.genderButtonText, newCustGender === 'Male' && styles.genderButtonTextActive]}>
                        GENTLEMAN
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.genderButton, newCustGender === 'Female' && styles.genderButtonActive]}
                      onPress={() => setNewCustGender('Female')}
                    >
                      <Ionicons name="female-outline" size={16} color={newCustGender === 'Female' ? '#000' : '#8E8E93'} />
                      <Text style={[styles.genderButtonText, newCustGender === 'Female' && styles.genderButtonTextActive]}>
                        LADY
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* VIP Toggle */}
                <View style={styles.vipFormRow}>
                  <Text style={styles.label}>MARK AS VIP CLIENT</Text>
                  <TouchableOpacity
                    style={[styles.checkbox, newCustVip && styles.checkboxActive]}
                    onPress={() => setNewCustVip(!newCustVip)}
                  >
                    {newCustVip && <Ionicons name="checkmark" size={16} color="#000" />}
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>NOTES & PREFERENCES</Text>
                  <TextInput
                    style={[styles.input, { height: 80 }]}
                    placeholder="e.g. Prefers double vents on jackets..."
                    placeholderTextColor="#555"
                    multiline={true}
                    numberOfLines={3}
                    value={newCustNotes}
                    onChangeText={setNewCustNotes}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreateCustomer}
                  activeOpacity={0.9}
                >
                  <Text style={styles.submitButtonText}>CREATE PROFILE</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CUSTOMER PROFILE & MEASUREMENTS MODAL */}
      {selectedCustomer && (
        <Modal
          visible={profileModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setProfileModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>{selectedCustomer.name}</Text>
                  <Text style={styles.modalSubId}>Joined: {selectedCustomer.joinDate}</Text>
                </View>
                <TouchableOpacity onPress={() => setProfileModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              {/* Sub-Tabs for customer view */}
              <View style={styles.subTabsContainer}>
                <TouchableOpacity
                  style={[styles.subTabButton, profileTab === 'details' && styles.subTabActive]}
                  onPress={() => setProfileTab('details')}
                >
                  <Text style={[styles.subTabText, profileTab === 'details' && styles.subTabTextActive]}>DETAILS</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.subTabButton, profileTab === 'measurements' && styles.subTabActive]}
                  onPress={() => setProfileTab('measurements')}
                >
                  <Text style={[styles.subTabText, profileTab === 'measurements' && styles.subTabTextActive]}>SIZING</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.subTabButton, profileTab === 'orders' && styles.subTabActive]}
                  onPress={() => setProfileTab('orders')}
                >
                  <Text style={[styles.subTabText, profileTab === 'orders' && styles.subTabTextActive]}>
                    ORDERS ({currentOrders.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.subTabButton, profileTab === 'payments' && styles.subTabActive]}
                  onPress={() => setProfileTab('payments')}
                >
                  <Text style={[styles.subTabText, profileTab === 'payments' && styles.subTabTextActive]}>
                    PAYMENTS ({currentPayments.length})
                  </Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {/* SUB TAB 1: DETAILS */}
                {profileTab === 'details' && (
                  <View style={styles.profileDetailsTab}>
                    <View style={styles.profileInfoCard}>
                      <Text style={styles.profileInfoLabel}>CONTACT PHONE</Text>
                      <Text style={styles.profileInfoText}>{selectedCustomer.phone}</Text>

                      {selectedCustomer.email && (
                        <>
                          <Text style={styles.profileInfoLabel}>EMAIL ADDRESS</Text>
                          <Text style={styles.profileInfoText}>{selectedCustomer.email}</Text>
                        </>
                      )}

                      <Text style={styles.profileInfoLabel}>CLIENT CATEGORY</Text>
                      <Text style={styles.profileInfoText}>
                        {selectedCustomer.gender === 'Male' ? 'Gentleman' : 'Lady'}{' '}
                        {selectedCustomer.vip ? '• VIP Customer' : ''}
                      </Text>

                      {selectedCustomer.notes && (
                        <>
                          <Text style={styles.profileInfoLabel}>CLIENT STYLING NOTES</Text>
                          <Text style={styles.profileInfoText}>{selectedCustomer.notes}</Text>
                        </>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.vipToggleButton}
                      onPress={() => {
                        updateCustomer(selectedCustomer.id, { vip: !selectedCustomer.vip });
                        setSelectedCustomer({ ...selectedCustomer, vip: !selectedCustomer.vip });
                      }}
                    >
                      <Text style={styles.vipToggleBtnText}>
                        {selectedCustomer.vip ? 'REVOKE VIP STATUS' : 'PROMOTE TO VIP STATUS'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* SUB TAB 2: MEASUREMENTS */}
                {profileTab === 'measurements' && (
                  <View style={styles.profileMeasurementsTab}>
                    {/* Template Picker */}
                    <Text style={styles.sectionHeading}>ACTIVE TEMPLATE</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateListScroller}>
                      {(selectedCustomer.gender === 'Male' ? MALE_TEMPLATES : FEMALE_TEMPLATES).map((temp) => (
                        <TouchableOpacity
                          key={temp}
                          style={[styles.templateTag, activeTemplate === temp && styles.templateTagActive]}
                          onPress={() => handleTemplateChange(temp)}
                        >
                          <Text style={[styles.templateTagText, activeTemplate === temp && styles.templateTagTextActive]}>
                            {temp}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                    {/* Sizing inputs */}
                    <View style={styles.sizingPad}>
                      <Text style={styles.sectionHeading}>SIZES (INCHES)</Text>
                      
                      {DEFAULT_MEASUREMENT_FIELDS.map((field) => (
                        <View key={field} style={styles.sizingRow}>
                          <Text style={styles.sizingLabel}>{field.replace(/([A-Z])/g, ' $1').trim()}</Text>
                          <TextInput
                            style={styles.sizingInput}
                            placeholder="--"
                            placeholderTextColor="#444"
                            keyboardType="numeric"
                            value={measurementValues[field] || ''}
                            onChangeText={(val) =>
                              setMeasurementValues({ ...measurementValues, [field]: val })
                            }
                          />
                        </View>
                      ))}

                      {/* Custom Added Fields */}
                      {customFields.map((field) => (
                        <View key={field} style={styles.sizingRow}>
                          <View style={styles.customFieldLabelContainer}>
                            <Text style={styles.sizingLabel}>{field}</Text>
                            <Text style={styles.customFieldBadge}>CUSTOM</Text>
                          </View>
                          <TextInput
                            style={styles.sizingInput}
                            placeholder="--"
                            placeholderTextColor="#444"
                            keyboardType="numeric"
                            value={measurementValues[field] || ''}
                            onChangeText={(val) =>
                              setMeasurementValues({ ...measurementValues, [field]: val })
                            }
                          />
                        </View>
                      ))}

                      {/* Add Custom Field Form */}
                      <View style={styles.addCustomFieldRow}>
                        <TextInput
                          style={styles.customFieldNameInput}
                          placeholder="e.g. Collar Type, Cuff"
                          placeholderTextColor="#555"
                          value={customFieldName}
                          onChangeText={setCustomFieldName}
                        />
                        <TouchableOpacity
                          style={styles.addCustomFieldButton}
                          onPress={handleAddCustomField}
                        >
                          <Text style={styles.addCustomFieldText}>ADD FIELD</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.saveSizingButton}
                      onPress={handleSaveMeasurements}
                    >
                      <Ionicons name="save-outline" size={16} color="#000" />
                      <Text style={styles.saveSizingText}>SAVE SIZING DATA</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* SUB TAB 3: ORDERS */}
                {profileTab === 'orders' && (
                  <View style={styles.profileOrdersTab}>
                    {currentOrders.length > 0 ? (
                      currentOrders.map((ord) => (
                        <View key={ord.id} style={styles.orderLogCard}>
                          <View style={styles.orderLogTop}>
                            <Text style={styles.orderLogId}>{ord.id}</Text>
                            <Text style={styles.orderLogStatus}>{ord.status.toUpperCase()}</Text>
                          </View>
                          <Text style={styles.orderLogDress}>{ord.dressType}</Text>
                          <Text style={styles.orderLogDate}>Delivery: {ord.deliveryDate}</Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyTabText}>No order history logged.</Text>
                    )}
                  </View>
                )}

                {/* SUB TAB 4: PAYMENTS */}
                {profileTab === 'payments' && (
                  <View style={styles.profilePaymentsTab}>
                    {currentPayments.length > 0 ? (
                      currentPayments.map((pmt) => (
                        <View key={pmt.id} style={styles.paymentLogCard}>
                          <View style={styles.pmtTop}>
                            <Text style={styles.pmtDate}>{pmt.date}</Text>
                            <Text style={styles.pmtAmount}>{formatCurrency(pmt.amount)}</Text>
                          </View>
                          <Text style={styles.pmtMethod}>
                            Payment Mode: {pmt.paymentMethod} {pmt.advance ? '(Advance Deposit)' : ''}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.emptyTabText}>No payment records found.</Text>
                    )}
                  </View>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

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
  createButton: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  createButtonText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    height: '100%',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  genderTagActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  genderTagText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  genderTagTextActive: {
    color: '#000',
  },
  vipToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginLeft: 'auto',
    gap: 4,
  },
  vipToggleActive: {
    backgroundColor: '#D4AF37',
  },
  vipToggleText: {
    color: '#D4AF37',
    fontSize: 12,
    fontWeight: '700',
  },
  vipToggleTextActive: {
    color: '#000',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  customerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  vipStar: {
    marginLeft: 6,
  },
  clientPhone: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  clientEmail: {
    fontSize: 12,
    color: '#555558',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  genderIndicator: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  indicatorMale: {
    backgroundColor: 'rgba(2, 136, 209, 0.12)',
  },
  indicatorFemale: {
    backgroundColor: 'rgba(171, 71, 188, 0.12)',
  },
  genderText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E5E5EA',
    marginTop: 16,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121214',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
  },
  modalSubId: {
    fontSize: 12,
    color: '#D4AF37',
    marginTop: 2,
  },
  modalScroll: {
    flex: 1,
    padding: 20,
  },
  subTabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#1C1C1E',
  },
  subTabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  subTabActive: {
    borderBottomColor: '#D4AF37',
  },
  subTabText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  subTabTextActive: {
    color: '#D4AF37',
  },
  // Details Tab
  profileDetailsTab: {
    paddingBottom: 40,
  },
  profileInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    marginBottom: 20,
  },
  profileInfoLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 12,
  },
  profileInfoText: {
    fontSize: 15,
    color: '#E5E5EA',
    lineHeight: 22,
    marginBottom: 4,
  },
  vipToggleButton: {
    borderColor: '#D4AF37',
    borderWidth: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vipToggleBtnText: {
    color: '#D4AF37',
    fontSize: 13,
    fontWeight: '700',
  },
  // Sizing Tab
  profileMeasurementsTab: {
    paddingBottom: 40,
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  templateListScroller: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  templateTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#2C2C2E',
    marginRight: 8,
  },
  templateTagActive: {
    backgroundColor: '#D4AF37',
  },
  templateTagText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  templateTagTextActive: {
    color: '#000',
  },
  sizingPad: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    marginBottom: 16,
  },
  sizingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  sizingLabel: {
    fontSize: 14,
    color: '#E5E5EA',
  },
  sizingInput: {
    width: 80,
    height: 36,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    color: '#FFF',
    textAlign: 'center',
    fontSize: 14,
  },
  customFieldLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customFieldBadge: {
    fontSize: 8,
    fontWeight: '700',
    color: '#D4AF37',
    borderColor: '#D4AF37',
    borderWidth: 0.5,
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  addCustomFieldRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  customFieldNameInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 6,
    color: '#FFF',
    paddingHorizontal: 12,
    fontSize: 13,
  },
  addCustomFieldButton: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 6,
  },
  addCustomFieldText: {
    color: '#D4AF37',
    fontSize: 11,
    fontWeight: '700',
  },
  saveSizingButton: {
    backgroundColor: '#D4AF37',
    flexDirection: 'row',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  saveSizingText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  // Order Log Tab
  profileOrdersTab: {
    paddingBottom: 40,
  },
  orderLogCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  orderLogTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderLogId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  orderLogStatus: {
    fontSize: 9,
    fontWeight: '700',
    color: '#4CAF50',
  },
  orderLogDress: {
    fontSize: 14,
    color: '#FFF',
    marginBottom: 4,
  },
  orderLogDate: {
    fontSize: 11,
    color: '#555558',
  },
  // Payment Log Tab
  profilePaymentsTab: {
    paddingBottom: 40,
  },
  paymentLogCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pmtTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  pmtDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  pmtAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4CAF50',
  },
  pmtMethod: {
    fontSize: 12,
    color: '#FFF',
  },
  emptyTabText: {
    fontSize: 13,
    color: '#555558',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 40,
  },
  // Form Styles inside modal
  form: {
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    color: '#FFF',
    height: 48,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  genderSelectorRow: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    height: 44,
    borderRadius: 8,
    gap: 8,
  },
  genderButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  genderButtonText: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '700',
  },
  genderButtonTextActive: {
    color: '#000',
  },
  vipFormRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  checkboxActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  submitButton: {
    backgroundColor: '#D4AF37',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
