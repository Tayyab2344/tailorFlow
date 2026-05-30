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
import { useStore, Order, OrderStatus, Employee } from '../hooks/use-store';
import DottedBackground from '../components/DottedBackground';

const STATUS_WORKFLOW: OrderStatus[] = [
  'Pending',
  'Measuring',
  'Cutting',
  'Stitching',
  'Embroidery',
  'Ironing',
  'Quality Check',
  'Ready',
  'Delivered',
];

export default function OrdersScreen() {
  const { orders, customers, employees, addOrder, updateOrderStatus, business } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  
  // Modals visibility
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // New Order Form state
  const [newOrderCustomer, setNewOrderCustomer] = useState<{ id: string; name: string; phone: string } | null>(null);
  const [newOrderDressType, setNewOrderDressType] = useState('');
  const [newOrderFabric, setNewOrderFabric] = useState('');
  const [newOrderQty, setNewOrderQty] = useState('1');
  const [newOrderPrice, setNewOrderPrice] = useState('');
  const [newOrderAdvance, setNewOrderAdvance] = useState('');
  const [newOrderTailor, setNewOrderTailor] = useState<Employee | null>(null);
  const [newOrderDeliveryDate, setNewOrderDeliveryDate] = useState('2026-06-15');
  const [newOrderNotes, setNewOrderNotes] = useState('');

  // Dropdown Visibility in Form
  const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
  const [tailorPickerVisible, setTailorPickerVisible] = useState(false);

  // Status Colors Mapping
  const statusColors: Record<OrderStatus, string> = {
    Pending: '#FFB300',
    Measuring: '#FFD54F',
    Cutting: '#B0BEC5',
    Stitching: '#0288D1',
    Embroidery: '#AB47BC',
    Ironing: '#78909C',
    'Quality Check': '#26A69A',
    Ready: '#4CAF50',
    Delivered: '#37474F',
  };

  // Filter and Search Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.dressType.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus =
      selectedStatusFilter === 'All' || o.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleAdvanceStatus = (order: Order) => {
    const currentIndex = STATUS_WORKFLOW.indexOf(order.status);
    if (currentIndex < STATUS_WORKFLOW.length - 1) {
      const nextStatus = STATUS_WORKFLOW[currentIndex + 1];
      updateOrderStatus(order.id, nextStatus, `Garment progressed to ${nextStatus}`);
      // Update local state if modal is open
      if (selectedOrder && selectedOrder.id === order.id) {
        const updated = orders.find(o => o.id === order.id);
        if (updated) setSelectedOrder(updated);
      }
    }
  };

  const handleCreateOrder = () => {
    if (!newOrderCustomer) {
      alert('Please select a customer.');
      return;
    }
    if (!newOrderDressType) {
      alert('Please enter dress type.');
      return;
    }
    const priceNum = parseFloat(newOrderPrice) || 0;
    const advanceNum = parseFloat(newOrderAdvance) || 0;

    const added = addOrder({
      customerId: newOrderCustomer.id,
      customerName: newOrderCustomer.name,
      customerPhone: newOrderCustomer.phone,
      dressType: newOrderDressType,
      fabricDetails: newOrderFabric || undefined,
      quantity: parseInt(newOrderQty) || 1,
      totalPrice: priceNum,
      advanceAmount: advanceNum,
      deliveryDate: newOrderDeliveryDate,
      tailorId: newOrderTailor?.id || undefined,
      tailorName: newOrderTailor?.name || undefined,
      notes: newOrderNotes || undefined,
    });

    // Reset Form
    setNewOrderCustomer(null);
    setNewOrderDressType('');
    setNewOrderFabric('');
    setNewOrderQty('1');
    setNewOrderPrice('');
    setNewOrderAdvance('');
    setNewOrderTailor(null);
    setNewOrderNotes('');
    setCreateModalVisible(false);

    alert(`Order ${added.id} created successfully!`);
  };

  const formatCurrency = (amount: number) => {
    const symbol = business?.currency.split(' ')[0] || '$';
    return `${symbol}${amount}`;
  };

  return (
    <View style={styles.container}>
      <DottedBackground />

      <View style={styles.header}>
        <Text style={styles.title}>Orders Pipeline</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setCreateModalVisible(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#000" />
          <Text style={styles.createButtonText}>NEW ORDER</Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#8E8E93" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by ID, customer or dress type..."
            placeholderTextColor="#666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Horizontal Status Filter Scroller */}
      <View style={styles.filterScrollerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroller}>
          <TouchableOpacity
            style={[styles.filterTag, selectedStatusFilter === 'All' && styles.filterTagActive]}
            onPress={() => setSelectedStatusFilter('All')}
          >
            <Text style={[styles.filterTagText, selectedStatusFilter === 'All' && styles.filterTagTextActive]}>
              All ({orders.length})
            </Text>
          </TouchableOpacity>
          {STATUS_WORKFLOW.map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterTag,
                  selectedStatusFilter === status && styles.filterTagActive,
                ]}
                onPress={() => setSelectedStatusFilter(status)}
              >
                <Text style={[styles.filterTagText, selectedStatusFilter === status && styles.filterTagTextActive]}>
                  {status} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.orderCard}
            onPress={() => handleOpenDetail(item)}
            activeOpacity={0.9}
          >
            <View style={styles.cardTop}>
              <Text style={styles.orderId}>{item.id}</Text>
              <View style={[styles.statusBadge, { backgroundColor: `${statusColors[item.status]}20`, borderColor: statusColors[item.status], borderWidth: 1 }]}>
                <Text style={[styles.statusText, { color: statusColors[item.status] }]}>{item.status.toUpperCase()}</Text>
              </View>
            </View>

            <Text style={styles.cardCustomer}>{item.customerName}</Text>
            <Text style={styles.cardDress}>{item.dressType}</Text>
            
            {item.fabricDetails && (
              <Text style={styles.cardFabric} numberOfLines={1}>
                Fabric: {item.fabricDetails}
              </Text>
            )}

            <View style={styles.cardFooter}>
              <View style={styles.footerDetail}>
                <Ionicons name="calendar-outline" size={14} color="#8E8E93" />
                <Text style={styles.footerDetailText}>Due: {item.deliveryDate}</Text>
              </View>

              <View style={styles.footerDetail}>
                <Ionicons name="person-outline" size={14} color="#8E8E93" />
                <Text style={styles.footerDetailText}>Tailor: {item.tailorName || 'Unassigned'}</Text>
              </View>
            </View>

            {item.status !== 'Delivered' && (
              <TouchableOpacity
                style={styles.advanceQuickButton}
                onPress={() => handleAdvanceStatus(item)}
              >
                <Text style={styles.advanceQuickText}>ADVANCE WORKFLOW</Text>
                <Ionicons name="arrow-forward" size={14} color="#D4AF37" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#333" />
            <Text style={styles.emptyTitle}>No Orders Found</Text>
            <Text style={styles.emptySubtitle}>Try adjusting your filters or create a new order.</Text>
          </View>
        }
      />

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <Modal
          visible={detailModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setDetailModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Order Details</Text>
                  <Text style={styles.modalSubId}>{selectedOrder.id}</Text>
                </View>
                <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                  <Ionicons name="close" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScroll}>
                {/* Details Section */}
                <View style={styles.modalCard}>
                  <Text style={styles.sectionLabel}>CLIENT & GARMENT</Text>
                  <Text style={styles.detailName}>{selectedOrder.customerName}</Text>
                  <Text style={styles.detailPhone}>{selectedOrder.customerPhone}</Text>
                  <View style={styles.divider} />
                  <Text style={styles.detailLabel}>Dress Type</Text>
                  <Text style={styles.detailValue}>{selectedOrder.dressType} (Qty: {selectedOrder.quantity})</Text>
                  
                  {selectedOrder.fabricDetails && (
                    <>
                      <Text style={styles.detailLabel}>Fabric Specifications</Text>
                      <Text style={styles.detailValue}>{selectedOrder.fabricDetails}</Text>
                    </>
                  )}

                  {selectedOrder.notes && (
                    <>
                      <Text style={styles.detailLabel}>Production Notes</Text>
                      <Text style={styles.detailValue}>{selectedOrder.notes}</Text>
                    </>
                  )}
                </View>

                {/* Status Controls */}
                <View style={styles.modalCard}>
                  <Text style={styles.sectionLabel}>STATUS & WORKFLOW</Text>
                  <View style={styles.statusRow}>
                    <Text style={styles.currentStatusLabel}>Current Phase: </Text>
                    <Text style={[styles.currentStatusValue, { color: statusColors[selectedOrder.status] }]}>
                      {selectedOrder.status}
                    </Text>
                  </View>

                  {selectedOrder.status !== 'Delivered' && (
                    <TouchableOpacity
                      style={styles.primaryActionButton}
                      onPress={() => handleAdvanceStatus(selectedOrder)}
                    >
                      <Text style={styles.primaryActionText}>
                        ADVANCE TO NEXT STAGE
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Financial Summary */}
                <View style={styles.modalCard}>
                  <Text style={styles.sectionLabel}>FINANCIAL SUMMARY</Text>
                  <View style={styles.financeRow}>
                    <Text style={styles.financeLabel}>Total Price</Text>
                    <Text style={styles.financeValue}>{formatCurrency(selectedOrder.totalPrice)}</Text>
                  </View>
                  <View style={styles.financeRow}>
                    <Text style={styles.financeLabel}>Advance Collected</Text>
                    <Text style={styles.financeValue}>{formatCurrency(selectedOrder.advanceAmount)}</Text>
                  </View>
                  <View style={styles.divider} />
                  <View style={styles.financeRow}>
                    <Text style={styles.financeLabel}>Remaining Balance</Text>
                    <Text style={[styles.financeValue, styles.goldText]}>
                      {formatCurrency(selectedOrder.totalPrice - selectedOrder.advanceAmount)}
                    </Text>
                  </View>
                </View>

                {/* Workforce assignment */}
                <View style={styles.modalCard}>
                  <Text style={styles.sectionLabel}>ASSIGNED WORKFORCE</Text>
                  <Text style={styles.detailValue}>
                    Responsible Tailor: {selectedOrder.tailorName || 'Not Assigned'}
                  </Text>
                </View>

                {/* Order Timeline History */}
                <View style={styles.modalCard}>
                  <Text style={styles.sectionLabel}>PRODUCTION HISTORY TIMELINE</Text>
                  {selectedOrder.timeline.map((item, idx) => (
                    <View key={idx} style={styles.timelineRow}>
                      <View style={styles.timelineCircle} />
                      <View style={styles.timelineBody}>
                        <Text style={styles.timelineStage}>{item.stage}</Text>
                        <Text style={styles.timelineMeta}>
                          {item.timestamp} • {item.updatedBy}
                        </Text>
                        {item.notes && <Text style={styles.timelineNotes}>{item.notes}</Text>}
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* CREATE ORDER MODAL */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Tailoring Order</Text>
              <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                <Ionicons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <View style={styles.formContainer}>
                
                {/* Customer Picker */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CUSTOMER</Text>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setCustomerPickerVisible(!customerPickerVisible)}
                  >
                    <Text style={styles.dropdownValue}>
                      {newOrderCustomer ? newOrderCustomer.name : 'Select Customer'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#D4AF37" />
                  </TouchableOpacity>

                  {customerPickerVisible && (
                    <View style={styles.dropdownList}>
                      {customers.map((c) => (
                        <TouchableOpacity
                          key={c.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setNewOrderCustomer(c);
                            setCustomerPickerVisible(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{c.name} ({c.phone})</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Dress Type */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>DRESS TYPE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Shalwar Kameez, Double Breasted Suit"
                    placeholderTextColor="#555"
                    value={newOrderDressType}
                    onChangeText={setNewOrderDressType}
                  />
                </View>

                {/* Fabric Details */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>FABRIC DETAILS</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Italian Wool, Silk brocade, 4.5 meters"
                    placeholderTextColor="#555"
                    value={newOrderFabric}
                    onChangeText={setNewOrderFabric}
                  />
                </View>

                {/* Quantity */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>QUANTITY</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="1"
                    placeholderTextColor="#555"
                    keyboardType="numeric"
                    value={newOrderQty}
                    onChangeText={setNewOrderQty}
                  />
                </View>

                {/* Price and Advance */}
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.label}>TOTAL PRICE</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1500"
                      placeholderTextColor="#555"
                      keyboardType="numeric"
                      value={newOrderPrice}
                      onChangeText={setNewOrderPrice}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.label}>ADVANCE PAYMENT</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="750"
                      placeholderTextColor="#555"
                      keyboardType="numeric"
                      value={newOrderAdvance}
                      onChangeText={setNewOrderAdvance}
                    />
                  </View>
                </View>

                {/* Tailor Picker */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ASSIGNED TAILOR</Text>
                  <TouchableOpacity
                    style={styles.dropdownTrigger}
                    onPress={() => setTailorPickerVisible(!tailorPickerVisible)}
                  >
                    <Text style={styles.dropdownValue}>
                      {newOrderTailor ? newOrderTailor.name : 'Select Tailor (Optional)'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color="#D4AF37" />
                  </TouchableOpacity>

                  {tailorPickerVisible && (
                    <View style={styles.dropdownList}>
                      {employees.filter(e => e.role === 'Tailor').map((e) => (
                        <TouchableOpacity
                          key={e.id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setNewOrderTailor(e);
                            setTailorPickerVisible(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{e.name} ({e.assignedOrdersCount} active tasks)</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* Delivery Date */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>DELIVERY DATE</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#555"
                    value={newOrderDeliveryDate}
                    onChangeText={setNewOrderDeliveryDate}
                  />
                </View>

                {/* Production Notes */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PRODUCTION NOTES</Text>
                  <TextInput
                    style={[styles.input, { height: 80 }]}
                    placeholder="Internal tailoring instructions..."
                    placeholderTextColor="#555"
                    multiline={true}
                    numberOfLines={3}
                    value={newOrderNotes}
                    onChangeText={setNewOrderNotes}
                  />
                </View>

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleCreateOrder}
                  activeOpacity={0.9}
                >
                  <Text style={styles.submitButtonText}>CREATE ORDER</Text>
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
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '700',
    color: '#FFF',
  },
  createButton: {
    backgroundColor: '#D4AF37', // Gold Accent
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
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
  filterScrollerContainer: {
    marginBottom: 16,
  },
  filterScroller: {
    paddingLeft: 20,
    flexDirection: 'row',
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
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D4AF37',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardCustomer: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  cardDress: {
    fontSize: 13,
    color: '#E5E5EA',
    marginBottom: 8,
  },
  cardFabric: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingTop: 12,
    marginBottom: 8,
  },
  footerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerDetailText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  advanceQuickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
  },
  advanceQuickText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
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
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  modalScroll: {
    flex: 1,
    padding: 20,
  },
  modalCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 16,
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D4AF37',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  detailName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  detailPhone: {
    fontSize: 13,
    color: '#8E8E93',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  detailLabel: {
    fontSize: 11,
    color: '#555558',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    color: '#E5E5EA',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentStatusLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  currentStatusValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  primaryActionButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryActionText: {
    color: '#000',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  financeLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  financeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  goldText: {
    color: '#D4AF37',
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D4AF37',
    marginTop: 4,
    marginRight: 12,
  },
  timelineBody: {
    flex: 1,
  },
  timelineStage: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
  },
  timelineMeta: {
    fontSize: 11,
    color: '#555558',
    marginTop: 2,
  },
  timelineNotes: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Form Styles inside modal
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
  row: {
    flexDirection: 'row',
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
