import { create } from 'zustand';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  gender: 'Male' | 'Female';
  notes?: string;
  vip: boolean;
  joinDate: string;
}

export interface Measurements {
  id: string;
  customerId: string;
  templateName: string; // e.g. "Suit", "Kurta", "Abaya"
  values: Record<string, number | string>;
  lastUpdated: string;
}

export type OrderStatus =
  | 'Pending'
  | 'Measuring'
  | 'Cutting'
  | 'Stitching'
  | 'Embroidery'
  | 'Ironing'
  | 'Quality Check'
  | 'Ready'
  | 'Delivered';

export interface OrderTimeline {
  stage: OrderStatus;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  tailorId?: string;
  tailorName?: string;
  dressType: string;
  fabricDetails?: string;
  quantity: number;
  status: OrderStatus;
  totalPrice: number;
  advanceAmount: number;
  deliveryDate: string;
  createdDate: string;
  notes?: string;
  referenceImages?: string[];
  timeline: OrderTimeline[];
}

export interface Employee {
  id: string;
  name: string;
  role: 'Admin' | 'Manager' | 'Tailor' | 'Receptionist' | 'Cashier';
  phone: string;
  status: 'Active' | 'Inactive';
  joinDate: string;
  productivityScore: number;
  assignedOrdersCount: number;
}

export interface Payment {
  id: string;
  orderId: string;
  customerName: string;
  amount: number;
  advance: boolean;
  paymentMethod: 'Cash' | 'Card' | 'Bank Transfer' | 'Tap to Pay';
  date: string;
}

export interface BusinessDetails {
  name: string;
  ownerName: string;
  category: string;
  currency: string;
  phone: string;
  address: string;
  city: string;
  email?: string;
  logoUrl?: string;
}

interface TailorFlowState {
  // Auth State
  isLoggedIn: boolean;
  user: { id: string; name: string; email: string; role: string } | null;
  business: BusinessDetails | null;

  // DB Collection lists
  customers: Customer[];
  measurements: Record<string, Measurements[]>; // customerId -> array of measurements
  orders: Order[];
  employees: Employee[];
  payments: Payment[];

  // App settings
  settings: {
    measurementUnit: 'inches' | 'cm';
    theme: 'dark' | 'light' | 'system';
  };

  // Actions
  login: (email: string) => void;
  logout: () => void;
  registerBusiness: (business: BusinessDetails) => void;
  
  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'joinDate'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  
  // Measurement actions
  saveMeasurements: (customerId: string, templateName: string, values: Record<string, number | string>) => void;
  
  // Order actions
  addOrder: (order: Omit<Order, 'id' | 'createdDate' | 'status' | 'timeline'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, notes?: string) => void;
  assignTailorToOrder: (orderId: string, employeeId: string) => void;

  // Employee actions
  addEmployee: (employee: Omit<Employee, 'id' | 'joinDate' | 'productivityScore' | 'assignedOrdersCount'>) => void;
  updateEmployeeStatus: (id: string, status: 'Active' | 'Inactive') => void;

  // Payment actions
  addPayment: (payment: Omit<Payment, 'id' | 'date'>) => void;

  // Settings actions
  updateSettings: (updates: Partial<TailorFlowState['settings']>) => void;
  updateBusinessDetails: (updates: Partial<BusinessDetails>) => void;
}

// Initial Preloaded Mock Data
const mockCustomers: Customer[] = [
  { id: 'c-1', name: 'James Sterling', phone: '+1 (555) 234-5678', email: 'james@sterling.com', gender: 'Male', notes: 'Prefers side vents and high armholes on jackets.', vip: true, joinDate: '2026-01-15' },
  { id: 'c-2', name: 'Elena Rostova', phone: '+1 (555) 876-5432', email: 'elena.rostova@couture.com', gender: 'Female', notes: 'Prefers silk blend linings. Delicate fabrics only.', vip: true, joinDate: '2026-02-10' },
  { id: 'c-3', name: 'Aiden Vance', phone: '+1 (555) 456-7890', email: 'aiden.vance@tech.co', gender: 'Male', notes: 'Modern slim fit. Wants flat front trousers.', vip: false, joinDate: '2026-03-22' },
  { id: 'c-4', name: 'Yasmin Patel', phone: '+1 (555) 345-6789', email: 'yasmin.patel@design.org', gender: 'Female', notes: 'Customizing a lehenga for bridal party. Gold accents.', vip: false, joinDate: '2026-04-05' },
];

const mockMeasurements: Record<string, Measurements[]> = {
  'c-1': [
    {
      id: 'm-1',
      customerId: 'c-1',
      templateName: 'Suit',
      values: { Neck: 15.5, Chest: 40, Waist: 34, Hips: 41, Sleeve: 25, Shoulder: 18.5, ShirtLength: 30.5, TrouserLength: 42 },
      lastUpdated: '2026-05-10',
    }
  ],
  'c-2': [
    {
      id: 'm-2',
      customerId: 'c-2',
      templateName: 'Lehenga',
      values: { Neck: 14, Chest: 36, Waist: 28, Hips: 38, Sleeve: 22, Shoulder: 15, ShirtLength: 26, TrouserLength: 40 },
      lastUpdated: '2026-05-12',
    }
  ],
  'c-3': [
    {
      id: 'm-3',
      customerId: 'c-3',
      templateName: 'Kurta',
      values: { Neck: 16, Chest: 42, Waist: 36, Hips: 43, Sleeve: 26, Shoulder: 19, ShirtLength: 38, TrouserLength: 41 },
      lastUpdated: '2026-05-18',
    }
  ],
};

const mockEmployees: Employee[] = [
  { id: 'e-1', name: 'Sofia Vance', role: 'Manager', phone: '+1 (555) 901-2345', status: 'Active', joinDate: '2025-06-01', productivityScore: 98, assignedOrdersCount: 0 },
  { id: 'e-2', name: 'Marcus Thorne', role: 'Tailor', phone: '+1 (555) 123-9876', status: 'Active', joinDate: '2025-08-15', productivityScore: 94, assignedOrdersCount: 2 },
  { id: 'e-3', name: 'Liam Mercer', role: 'Tailor', phone: '+1 (555) 890-1234', status: 'Active', joinDate: '2025-10-10', productivityScore: 89, assignedOrdersCount: 1 },
  { id: 'e-4', name: 'Zara Kian', role: 'Receptionist', phone: '+1 (555) 234-9081', status: 'Active', joinDate: '2026-01-08', productivityScore: 96, assignedOrdersCount: 0 },
];

const mockOrders: Order[] = [
  {
    id: 'TF-1001',
    customerId: 'c-1',
    customerName: 'James Sterling',
    customerPhone: '+1 (555) 234-5678',
    tailorId: 'e-2',
    tailorName: 'Marcus Thorne',
    dressType: 'Bespoke Tweed Suit',
    fabricDetails: 'Scabal Heritage Wool - Charcoal Grey',
    quantity: 1,
    status: 'Stitching',
    totalPrice: 1500,
    advanceAmount: 750,
    deliveryDate: '2026-06-15',
    createdDate: '2026-05-10',
    notes: 'Double-breasted jacket, standard collar notches.',
    timeline: [
      { stage: 'Pending', timestamp: '2026-05-10 10:00', updatedBy: 'Zara Kian' },
      { stage: 'Measuring', timestamp: '2026-05-10 11:30', updatedBy: 'Zara Kian' },
      { stage: 'Cutting', timestamp: '2026-05-12 14:00', updatedBy: 'Marcus Thorne' },
      { stage: 'Stitching', timestamp: '2026-05-15 09:00', updatedBy: 'Marcus Thorne', notes: 'Internal lining attached, now stitching sleeves.' }
    ]
  },
  {
    id: 'TF-1002',
    customerId: 'c-2',
    customerName: 'Elena Rostova',
    customerPhone: '+1 (555) 876-5432',
    tailorId: 'e-3',
    tailorName: 'Liam Mercer',
    dressType: 'Silk Bridal Lehenga',
    fabricDetails: 'Banarasi Brocade Silk - Royal Red & Gold',
    quantity: 1,
    status: 'Embroidery',
    totalPrice: 2800,
    advanceAmount: 1500,
    deliveryDate: '2026-06-20',
    createdDate: '2026-05-12',
    notes: 'Intricate zardozi embroidery work requested on lower panels.',
    timeline: [
      { stage: 'Pending', timestamp: '2026-05-12 12:00', updatedBy: 'Zara Kian' },
      { stage: 'Measuring', timestamp: '2026-05-12 13:00', updatedBy: 'Zara Kian' },
      { stage: 'Cutting', timestamp: '2026-05-14 16:30', updatedBy: 'Liam Mercer' },
      { stage: 'Stitching', timestamp: '2026-05-18 11:00', updatedBy: 'Liam Mercer' },
      { stage: 'Embroidery', timestamp: '2026-05-20 10:00', updatedBy: 'Liam Mercer', notes: 'Sent to embroidery specialist.' }
    ]
  },
  {
    id: 'TF-1003',
    customerId: 'c-3',
    customerName: 'Aiden Vance',
    customerPhone: '+1 (555) 456-7890',
    tailorId: 'e-2',
    tailorName: 'Marcus Thorne',
    dressType: 'Linen Summer Kurta',
    fabricDetails: 'Pure Irish Linen - Ivory White',
    quantity: 2,
    status: 'Ready',
    totalPrice: 350,
    advanceAmount: 350,
    deliveryDate: '2026-06-02',
    createdDate: '2026-05-18',
    notes: 'Straight fit, loop buttons.',
    timeline: [
      { stage: 'Pending', timestamp: '2026-05-18 15:30', updatedBy: 'Sofia Vance' },
      { stage: 'Measuring', timestamp: '2026-05-18 16:00', updatedBy: 'Sofia Vance' },
      { stage: 'Cutting', timestamp: '2026-05-20 10:00', updatedBy: 'Marcus Thorne' },
      { stage: 'Stitching', timestamp: '2026-05-22 15:00', updatedBy: 'Marcus Thorne' },
      { stage: 'Ironing', timestamp: '2026-05-25 11:00', updatedBy: 'Marcus Thorne' },
      { stage: 'Quality Check', timestamp: '2026-05-26 14:00', updatedBy: 'Sofia Vance' },
      { stage: 'Ready', timestamp: '2026-05-27 10:00', updatedBy: 'Sofia Vance', notes: 'Ready for customer pickup.' }
    ]
  }
];

const mockPayments: Payment[] = [
  { id: 'p-1', orderId: 'TF-1001', customerName: 'James Sterling', amount: 750, advance: true, paymentMethod: 'Card', date: '2026-05-10' },
  { id: 'p-2', orderId: 'TF-1002', customerName: 'Elena Rostova', amount: 1500, advance: true, paymentMethod: 'Bank Transfer', date: '2026-05-12' },
  { id: 'p-3', orderId: 'TF-1003', customerName: 'Aiden Vance', amount: 350, advance: true, paymentMethod: 'Cash', date: '2026-05-18' }
];

export const useStore = create<TailorFlowState>((set, get) => ({
  // Auth Initial State
  isLoggedIn: false,
  user: null,
  business: {
    name: 'Savile Row Atelier',
    ownerName: 'Alexander McQueen',
    category: 'Bespoke Haute Couture',
    currency: 'USD ($)',
    phone: '+1 (555) 888-9999',
    address: '14 Savile Row, Mayfair',
    city: 'London',
  },

  // Collections Lists
  customers: mockCustomers,
  measurements: mockMeasurements,
  orders: mockOrders,
  employees: mockEmployees,
  payments: mockPayments,

  // App settings
  settings: {
    measurementUnit: 'inches',
    theme: 'dark',
  },

  // Actions
  login: (email: string) => {
    set({
      isLoggedIn: true,
      user: {
        id: 'u-1',
        name: 'Alexander',
        email: email,
        role: 'Admin',
      }
    });
  },

  logout: () => {
    set({ isLoggedIn: false, user: null });
  },

  registerBusiness: (business: BusinessDetails) => {
    set({
      business,
      isLoggedIn: true,
      user: {
        id: 'u-1',
        name: business.ownerName,
        email: business.email || 'atelier@tailorflow.com',
        role: 'Admin',
      }
    });
  },

  addCustomer: (customerData) => {
    const newId = `c-${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      joinDate: new Date().toISOString().split('T')[0],
    };
    set((state) => ({
      customers: [newCustomer, ...state.customers],
    }));
    return newCustomer;
  },

  updateCustomer: (id, updates) => {
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },

  saveMeasurements: (customerId, templateName, values) => {
    set((state) => {
      const existing = state.measurements[customerId] || [];
      const newMeasurement: Measurements = {
        id: `m-${Date.now()}`,
        customerId,
        templateName,
        values,
        lastUpdated: new Date().toISOString().split('T')[0],
      };
      
      // Filter out same template name if exists, then add the new version
      const updated = [newMeasurement, ...existing.filter((m) => m.templateName !== templateName)];
      
      return {
        measurements: {
          ...state.measurements,
          [customerId]: updated,
        }
      };
    });
  },

  addOrder: (orderData) => {
    const newId = `TF-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: newId,
      status: 'Pending',
      createdDate: new Date().toISOString().split('T')[0],
      timeline: [
        {
          stage: 'Pending',
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          updatedBy: get().user?.name || 'Receptionist',
          notes: 'Order created',
        }
      ]
    };

    set((state) => {
      // Increment assigned count for the tailor
      const updatedEmployees = state.employees.map((emp) => {
        if (emp.id === orderData.tailorId) {
          return { ...emp, assignedOrdersCount: emp.assignedOrdersCount + 1 };
        }
        return emp;
      });

      // Log the advance payment if it exists
      const updatedPayments = [...state.payments];
      if (orderData.advanceAmount > 0) {
        updatedPayments.unshift({
          id: `p-${Date.now()}`,
          orderId: newId,
          customerName: orderData.customerName,
          amount: orderData.advanceAmount,
          advance: true,
          paymentMethod: 'Cash',
          date: new Date().toISOString().split('T')[0],
        });
      }

      return {
        orders: [newOrder, ...state.orders],
        employees: updatedEmployees,
        payments: updatedPayments,
      };
    });

    return newOrder;
  },

  updateOrderStatus: (orderId, status, notes) => {
    set((state) => {
      const updatedOrders = state.orders.map((ord) => {
        if (ord.id === orderId) {
          const prevStatus = ord.status;
          
          // Don't duplicate if status is the same
          if (prevStatus === status) return ord;

          const updatedTimeline = [
            ...ord.timeline,
            {
              stage: status,
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              updatedBy: state.user?.name || 'Director',
              notes: notes || `Moved to ${status}`,
            }
          ];

          return {
            ...ord,
            status,
            timeline: updatedTimeline,
          };
        }
        return ord;
      });

      // Find if we need to adjust employees
      const order = state.orders.find(o => o.id === orderId);
      const isStatusDelivering = status === 'Delivered' && order?.status !== 'Delivered';

      return {
        orders: updatedOrders,
        ...(isStatusDelivering ? { employees: state.employees.map(emp => {
          if (emp.id === order?.tailorId) {
            return {
              ...emp,
              assignedOrdersCount: Math.max(0, emp.assignedOrdersCount - 1),
            };
          }
          return emp;
        }) } : {})
      };
    });
  },

  assignTailorToOrder: (orderId, employeeId) => {
    set((state) => {
      const tailor = state.employees.find((emp) => emp.id === employeeId);
      if (!tailor) return {};

      const updatedOrders = state.orders.map((ord) => {
        if (ord.id === orderId) {
          const oldTailorId = ord.tailorId;

          // If same tailor is assigned, skip
          if (oldTailorId === employeeId) return ord;

          return {
            ...ord,
            tailorId: employeeId,
            tailorName: tailor.name,
          };
        }
        return ord;
      });

      const updatedEmployees = state.employees.map((emp) => {
        const order = state.orders.find((o) => o.id === orderId);
        const oldTailorId = order?.tailorId;

        if (emp.id === employeeId) {
          return { ...emp, assignedOrdersCount: emp.assignedOrdersCount + 1 };
        }
        if (emp.id === oldTailorId) {
          return { ...emp, assignedOrdersCount: Math.max(0, emp.assignedOrdersCount - 1) };
        }
        return emp;
      });

      return {
        orders: updatedOrders,
        employees: updatedEmployees,
      };
    });
  },

  addEmployee: (employeeData) => {
    const newEmployee: Employee = {
      ...employeeData,
      id: `e-${Date.now()}`,
      joinDate: new Date().toISOString().split('T')[0],
      productivityScore: 90,
      assignedOrdersCount: 0,
    };
    set((state) => ({
      employees: [...state.employees, newEmployee],
    }));
  },

  updateEmployeeStatus: (id, status) => {
    set((state) => ({
      employees: state.employees.map((emp) => (emp.id === id ? { ...emp, status } : emp)),
    }));
  },

  addPayment: (paymentData) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `p-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    set((state) => {
      // Find order to update advance or record payment
      const updatedOrders = state.orders.map((ord) => {
        if (ord.id === paymentData.orderId) {
          // If a new payment is made, let's update some notes/timeline
          return {
            ...ord,
            timeline: [
              ...ord.timeline,
              {
                stage: ord.status,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
                updatedBy: state.user?.name || 'Cashier',
                notes: `Payment of ${state.business?.currency.split(' ')[0] || '$'}${paymentData.amount} received via ${paymentData.paymentMethod}`,
              }
            ]
          };
        }
        return ord;
      });

      return {
        payments: [newPayment, ...state.payments],
        orders: updatedOrders,
      };
    });
  },

  updateSettings: (updates) => {
    set((state) => ({
      settings: { ...state.settings, ...updates },
    }));
  },

  updateBusinessDetails: (updates) => {
    set((state) => ({
      business: state.business ? { ...state.business, ...updates } : null,
    }));
  },
}));
