import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, OrderStatus } from '../hooks/use-store';
import DottedBackground from '../components/DottedBackground';
import LogoT from '../components/LogoT';

export default function DashboardScreen() {
  const { business, customers, orders, payments } = useStore();

  // Calculations
  const totalCustomers = customers.length;
  const activeOrders = orders.filter(
    (o) => o.status !== 'Delivered' && o.status !== 'Ready'
  ).length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
  
  // Custom logic for delayed orders: Let's assume delivery date is past current date (e.g. today is May 30, 2026)
  const todayStr = '2026-05-30';
  const delayedOrders = orders.filter(
    (o) => o.status !== 'Delivered' && o.deliveryDate < todayStr
  ).length;

  const readyOrders = orders.filter((o) => o.status === 'Ready').length;

  // Revenue calculation
  const totalMonthlyRevenue = payments.reduce((acc, p) => acc + p.amount, 0);
  const todayRevenue = payments
    .filter((p) => p.date === todayStr)
    .reduce((acc, p) => acc + p.amount, 0);

  // Workflow stages counts
  const stages: OrderStatus[] = [
    'Measuring',
    'Cutting',
    'Stitching',
    'Embroidery',
    'Ironing',
    'Quality Check',
    'Ready',
    'Delivered',
  ];

  const getStageCount = (stage: OrderStatus) => {
    return orders.filter((o) => o.status === stage).length;
  };

  // Recent activities generated from order timelines
  const getRecentActivities = () => {
    const activities: { id: string; text: string; time: string; type: string }[] = [];
    orders.forEach((o) => {
      o.timeline.forEach((t, i) => {
        activities.push({
          id: `${o.id}-${i}`,
          text: `Order ${o.id} (${o.dressType}): ${t.notes || `Moved to ${t.stage}`}`,
          time: t.timestamp.split(' ')[1] || '12:00',
          type: t.stage,
        });
      });
    });
    // Sort by timestamp or just take the latest 5
    return activities.slice(-5).reverse();
  };

  const activities = getRecentActivities();

  // Helper to format currency
  const formatCurrency = (amount: number) => {
    const symbol = business?.currency.split(' ')[0] || '$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  return (
    <View style={styles.container}>
      <DottedBackground />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.businessTitle}>{business?.name || 'My Atelier'}</Text>
            <Text style={styles.businessSubtitle}>
              {business?.city || 'London'} • {business?.category || 'Bespoke'}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileBadge} activeOpacity={0.8}>
            <LogoT size={40} showTicks={false} />
          </TouchableOpacity>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsGrid}>
          {/* Card 1: Active Orders */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>ACTIVE ORDERS</Text>
              <Ionicons name="cut-outline" size={16} color="#D4AF37" />
            </View>
            <Text style={styles.metricValue}>{activeOrders}</Text>
            <Text style={styles.metricSubtext}>{pendingOrders} pending • {totalCustomers} clients</Text>
          </View>

          {/* Card 2: Ready for Pickup */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>READY FOR DELIVERY</Text>
              <Ionicons name="checkmark-circle-outline" size={16} color="#4CAF50" />
            </View>
            <Text style={styles.metricValue}>{readyOrders}</Text>
            <Text style={styles.metricSubtext}>Awaiting customer collection</Text>
          </View>

          {/* Card 3: Monthly Revenue */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>MONTH REVENUE</Text>
              <Ionicons name="trending-up-outline" size={16} color="#D4AF37" />
            </View>
            <Text style={[styles.metricValue, styles.goldText]}>
              {formatCurrency(totalMonthlyRevenue)}
            </Text>
            <Text style={styles.metricSubtext}>Today: {formatCurrency(todayRevenue)}</Text>
          </View>

          {/* Card 4: Delayed Orders */}
          <View style={[styles.metricCard, delayedOrders > 0 && styles.delayedCardBorder]}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>DELAY WARNINGS</Text>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={delayedOrders > 0 ? '#FF5252' : '#888'}
              />
            </View>
            <Text style={[styles.metricValue, delayedOrders > 0 && styles.redText]}>
              {delayedOrders}
            </Text>
            <Text style={styles.metricSubtext}>
              {delayedOrders > 0 ? 'Requires attention!' : 'All orders on track'}
            </Text>
          </View>
        </View>

        {/* Revenue Performance Card */}
        <View style={styles.luxuryCard}>
          <Text style={styles.cardTitle}>FINANCIAL INSIGHTS</Text>
          <View style={styles.revenueRow}>
            <View style={styles.revenueCol}>
              <Text style={styles.revenueLabel}>TODAY</Text>
              <Text style={styles.revenueValue}>{formatCurrency(todayRevenue)}</Text>
              <Text style={styles.revenueTrend}>
                <Ionicons name="arrow-up" size={12} color="#4CAF50" /> +12% vs yesterday
              </Text>
            </View>
            <View style={styles.revenueDivider} />
            <View style={styles.revenueCol}>
              <Text style={styles.revenueLabel}>THIS WEEK</Text>
              <Text style={styles.revenueValue}>{formatCurrency(totalMonthlyRevenue * 0.7)}</Text>
              <Text style={styles.revenueTrend}>
                <Ionicons name="arrow-up" size={12} color="#4CAF50" /> +5% vs last week
              </Text>
            </View>
            <View style={styles.revenueDivider} />
            <View style={styles.revenueCol}>
              <Text style={styles.revenueLabel}>THIS MONTH</Text>
              <Text style={styles.revenueValue}>{formatCurrency(totalMonthlyRevenue)}</Text>
              <Text style={styles.revenueTrend}>
                <Ionicons name="arrow-up" size={12} color="#4CAF50" /> Target 85% met
              </Text>
            </View>
          </View>
        </View>

        {/* Workflow Pipeline Widget */}
        <View style={styles.luxuryCard}>
          <Text style={styles.cardTitle}>ATELIER WORKFLOW PIPELINE</Text>
          <Text style={styles.cardSubtitle}>Current garment tracking by production phase.</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pipelineScroll}>
            {stages.map((stage) => {
              const count = getStageCount(stage);
              return (
                <View key={stage} style={styles.pipelineNode}>
                  <View style={[styles.pipelineBadge, count > 0 && styles.activePipelineBadge]}>
                    <Text style={[styles.pipelineCount, count > 0 && styles.activePipelineCount]}>
                      {count}
                    </Text>
                  </View>
                  <Text style={styles.pipelineLabel}>{stage}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* Recent Activity Feed */}
        <View style={styles.luxuryCard}>
          <Text style={styles.cardTitle}>RECENT ACTIVITY LOG</Text>
          <View style={styles.activityList}>
            {activities.length > 0 ? (
              activities.map((act) => (
                <View key={act.id} style={styles.activityItem}>
                  <View style={styles.activityIndicatorContainer}>
                    <View style={[styles.activityDot, (styles as any)[`dot${act.type.replace(/\s+/g, '')}`] || styles.dotDefault]} />
                    <View style={styles.activityLine} />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText}>{act.text}</Text>
                    <Text style={styles.activityTime}>{act.time}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No activities logged yet.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0B', // Rich dark premium background
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  businessTitle: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  businessSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
    letterSpacing: 1,
  },
  profileBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37', // Gold ring
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 3,
  },
  delayedCardBorder: {
    borderColor: 'rgba(255, 82, 82, 0.4)',
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  metricLabel: {
    fontSize: 9,
    color: '#8E8E93',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  metricValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  metricSubtext: {
    fontSize: 10,
    color: '#555558',
  },
  goldText: {
    color: '#D4AF37',
  },
  redText: {
    color: '#FF5252',
  },
  luxuryCard: {
    backgroundColor: 'rgba(28, 28, 30, 0.7)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D4AF37', // Gold Title
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 20,
  },
  revenueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueCol: {
    flex: 1,
  },
  revenueLabel: {
    fontSize: 9,
    color: '#555558',
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  revenueTrend: {
    fontSize: 9,
    color: '#4CAF50',
    fontWeight: '600',
  },
  revenueDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 12,
  },
  pipelineScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  pipelineNode: {
    alignItems: 'center',
    marginRight: 20,
    width: 70,
  },
  pipelineBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  activePipelineBadge: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  pipelineCount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#666668',
  },
  activePipelineCount: {
    color: '#D4AF37',
  },
  pipelineLabel: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 12,
  },
  activityList: {
    marginTop: 8,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityIndicatorContainer: {
    alignItems: 'center',
    marginRight: 16,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  dotPending: { backgroundColor: '#FFB300' },
  dotMeasuring: { backgroundColor: '#FFD54F' },
  dotCutting: { backgroundColor: '#E0E0E0' },
  dotStitching: { backgroundColor: '#0288D1' },
  dotEmbroidery: { backgroundColor: '#AB47BC' },
  dotIroning: { backgroundColor: '#78909C' },
  dotQualityCheck: { backgroundColor: '#26A69A' },
  dotReady: { backgroundColor: '#4CAF50' },
  dotDelivered: { backgroundColor: '#004D40' },
  dotDefault: { backgroundColor: '#D4AF37' },
  activityLine: {
    width: 1,
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginTop: 4,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    color: '#E5E5EA',
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    color: '#555558',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#555558',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});
