import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, Employee } from '../hooks/use-store';
import DottedBackground from '../components/DottedBackground';

const ROLES = ['Admin', 'Manager', 'Tailor', 'Receptionist', 'Cashier'];

export default function WorkforceScreen() {
  const { employees, addEmployee, updateEmployeeStatus, orders } = useStore();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');

  // Form State: New Employee
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPhone, setNewEmpPhone] = useState('');
  const [newEmpRole, setNewEmpRole] = useState<'Admin' | 'Manager' | 'Tailor' | 'Receptionist' | 'Cashier'>('Tailor');
  
  const [rolePickerVisible, setRolePickerVisible] = useState(false);

  // Workforce Analytics calculations
  const totalStaff = employees.length;
  const activeTailors = employees.filter((e) => e.role === 'Tailor' && e.status === 'Active').length;
  
  // Calculate average productivity
  const averageProductivity = Math.round(
    employees.reduce((acc, e) => acc + e.productivityScore, 0) / employees.length
  ) || 0;

  // Active tasks load total
  const totalActiveTasks = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Ready'
  ).length;

  const filteredEmployees = employees.filter((e) => {
    return selectedRoleFilter === 'All' || e.role === selectedRoleFilter;
  });

  const handleCreateEmployee = () => {
    if (!newEmpName || !newEmpPhone) {
      alert('Please fill out Name and Phone.');
      return;
    }

    addEmployee({
      name: newEmpName,
      role: newEmpRole,
      phone: newEmpPhone,
      status: 'Active',
    });

    // Reset Form
    setNewEmpName('');
    setNewEmpPhone('');
    setNewEmpRole('Tailor');
    setCreateModalVisible(false);

    alert('Team member registered successfully!');
  };

  const handleToggleStatus = (emp: Employee) => {
    const nextStatus = emp.status === 'Active' ? 'Inactive' : 'Active';
    updateEmployeeStatus(emp.id, nextStatus);
  };

  // Helper for role coloring
  const roleColors: Record<string, string> = {
    Admin: '#E53935',
    Manager: '#8E24AA',
    Tailor: '#D4AF37',
    Receptionist: '#00ACC1',
    Cashier: '#43A047',
  };

  return (
    <View style={styles.container}>
      <DottedBackground />

      <View style={styles.header}>
        <Text style={styles.title}>Atelier Workforce</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#000" />
          <Text style={styles.createButtonText}>ADD STAFF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Analytics Widgets Row */}
        <View style={styles.analyticsRow}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsLabel}>TOTAL STAFF</Text>
            <Text style={styles.analyticsValue}>{totalStaff}</Text>
            <Text style={styles.analyticsSubtext}>{activeTailors} active tailors</Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsLabel}>PRODUCTIVITY AVG</Text>
            <Text style={[styles.analyticsValue, styles.goldText]}>{averageProductivity}%</Text>
            <Text style={styles.analyticsSubtext}>High quality output</Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsLabel}>ACTIVE LOADS</Text>
            <Text style={styles.analyticsValue}>{totalActiveTasks}</Text>
            <Text style={styles.analyticsSubtext}>Total tasks assigned</Text>
          </View>
        </View>

        {/* Filters */}
        <Text style={styles.sectionHeading}>TEAM REGISTRY</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroller}>
          <TouchableOpacity
            style={[styles.filterTag, selectedRoleFilter === 'All' && styles.filterTagActive]}
            onPress={() => setSelectedRoleFilter('All')}
          >
            <Text style={[styles.filterTagText, selectedRoleFilter === 'All' && styles.filterTagTextActive]}>
              All Roles
            </Text>
          </TouchableOpacity>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role}
              style={[styles.filterTag, selectedRoleFilter === role && styles.filterTagActive]}
              onPress={() => setSelectedRoleFilter(role)}
            >
              <Text style={[styles.filterTagText, selectedRoleFilter === role && styles.filterTagTextActive]}>
                {role}s
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Employee Cards List */}
        <View style={styles.employeesContainer}>
          {filteredEmployees.map((emp) => (
            <View key={emp.id} style={styles.employeeCard}>
              <View style={styles.cardHeader}>
                <View style={styles.nameContainer}>
                  <Text style={styles.empName}>{emp.name}</Text>
                  <View style={[styles.roleBadge, { backgroundColor: `${roleColors[emp.role]}15`, borderColor: roleColors[emp.role] }]}>
                    <Text style={[styles.roleText, { color: roleColors[emp.role] }]}>{emp.role.toUpperCase()}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.statusToggleBtn, emp.status === 'Active' ? styles.statusToggleBtnActive : styles.statusToggleBtnInactive]}
                  onPress={() => handleToggleStatus(emp)}
                >
                  <Text style={[styles.statusToggleBtnText, emp.status === 'Active' ? styles.statusToggleBtnTextActive : styles.statusToggleBtnTextInactive]}>
                    {emp.status}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.empPhone}>{emp.phone}</Text>
              <Text style={styles.empMeta}>Joined: {emp.joinDate}</Text>
              
              <View style={styles.cardDivider} />

              <View style={styles.cardFooter}>
                <View style={styles.footerStat}>
                  <Text style={styles.footerStatLabel}>ACTIVE TASKS</Text>
                  <Text style={styles.footerStatValue}>
                    {emp.role === 'Tailor' ? emp.assignedOrdersCount : '--'}
                  </Text>
                </View>

                <View style={styles.footerStat}>
                  <Text style={styles.footerStatLabel}>PRODUCTIVITY SCORE</Text>
                  <View style={styles.productivityContainer}>
                    <Text style={[styles.footerStatValue, styles.goldText]}>{emp.productivityScore}%</Text>
                    {/* Visual Progress Bar */}
                    <View style={styles.progressBarBg}>
                      <View style={[styles.progressBarFill, { width: `${emp.productivityScore}%` }]} />
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* ADD EMPLOYEE MODAL */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Staff Member</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.formContainer}>
                
                {/* Employee Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>FULL NAME</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Liam Mercer"
                    placeholderTextColor="#555"
                    value={newEmpName}
                    onChangeText={setNewEmpName}
                  />
                </View>

                {/* Role Picker */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ROLE</Text>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setRolePickerVisible(!rolePickerVisible)}
                  >
                    <Text style={styles.dropdownValue}>{newEmpRole}</Text>
                    <Ionicons name="chevron-down" size={18} color="#D4AF37" />
                  </TouchableOpacity>

                  {rolePickerVisible && (
                    <View style={styles.dropdownList}>
                      {ROLES.map((role) => (
                        <TouchableOpacity
                          key={role}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setNewEmpRole(role as any);
                            setRolePickerVisible(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{role}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Phone */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PHONE NUMBER</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor="#555"
                    keyboardType="phone-pad"
                    value={newEmpPhone}
                    onChangeText={setNewEmpPhone}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreateEmployee}
                  activeOpacity={0.9}
                >
                  <Text style={styles.submitButtonText}>ADD MEMBER</Text>
                </TouchableOpacity>

              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
    marginBottom: 12,
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
    gap: 4,
  },
  createButtonText: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  analyticsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  analyticsCard: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  analyticsLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  analyticsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  analyticsSubtext: {
    fontSize: 8,
    color: '#555558',
    textAlign: 'center',
  },
  goldText: {
    color: '#D4AF37',
  },
  sectionHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 1.2,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  filtersScroller: {
    paddingLeft: 20,
    marginBottom: 16,
  },
  filterTag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#1C1C1E',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  filterTagActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  filterTagText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  filterTagTextActive: {
    color: '#000',
  },
  employeesContainer: {
    paddingHorizontal: 20,
  },
  employeeCard: {
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  empName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  roleBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 0.5,
  },
  roleText: {
    fontSize: 8,
    fontWeight: '700',
  },
  statusToggleBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusToggleBtnActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
  },
  statusToggleBtnInactive: {
    backgroundColor: 'rgba(255, 82, 82, 0.15)',
  },
  statusToggleBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusToggleBtnTextActive: {
    color: '#4CAF50',
  },
  statusToggleBtnTextInactive: {
    color: '#FF5252',
  },
  empPhone: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  empMeta: {
    fontSize: 11,
    color: '#555558',
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerStat: {
    flex: 1,
  },
  footerStatLabel: {
    fontSize: 8,
    color: '#555558',
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  footerStatValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  productivityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    maxWidth: 60,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#D4AF37',
    borderRadius: 2,
  },
  // Modal Overlay and Content
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
    height: '60%',
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
  modalScroll: {
    flex: 1,
    padding: 20,
  },
  formContainer: {
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
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 48,
  },
  dropdownValue: {
    color: '#FFF',
    fontSize: 14,
  },
  dropdownList: {
    backgroundColor: '#1C1C1E',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  dropdownItemText: {
    color: '#FFF',
    fontSize: 13,
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
