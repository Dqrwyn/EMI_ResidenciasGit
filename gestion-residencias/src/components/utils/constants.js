// src/components/utils/constants.js

export const COLOR_PALETTE = {
  primary: {
    main: '#004F9F',
    dark: '#003366',
    light: '#DFEAF8'
  },
  secondary: {
    main: '#FFC107'
  },
  background: {
    light: '#FFFFFF',
    dark: '#111827'
  }
};

export const ROOM_TYPES = {
  INDIVIDUAL: 'INDIVIDUAL',
  SHARED: 'SHARED'
};

export const ADMIN_ROOM_TYPES = {
  INDIVIDUAL: 'INDIVIDUAL',
  SHARED: 'SHARED'
};

export const ASSET_STATUS = {
  OPTIMO: 'Óptimo',
  DETERIORADO: 'Deteriorado',
  EN_REPARACION: 'En reparación',
  NO_UBICADO: 'No ubicado',
  OTRO: 'Otro'
};

export const PAYMENT_STATUS = {
  PAGADO: 'pagado',
  PENDIENTE: 'pendiente',
  MOROSO: 'moroso'
};

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const PAYMENT_MONTHS = [
  'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const ACADEMIC_YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i);

export const FLOORS = [
  { id: 'piso1', name: 'Piso 1' },
  { id: 'piso2', name: 'Piso 2' },
  { id: 'piso3', name: 'Piso 3' },
  { id: 'piso4', name: 'Piso 4' }
];

export const ADMIN_FLOORS = [
  { id: 'admin-piso1', name: 'Piso 1' },
  { id: 'admin-piso2', name: 'Piso 2' }
];

export const SIDES = ['Izquierda', 'Derecha'];
export const ADMIN_SIDES = ['Izquierda', 'Derecha'];
export const ROOMS_PER_SIDE = 7;
export const ADMIN_ROOMS_PER_SIDE = 6;

export const ROOM_PRICES = {
  INDIVIDUAL: 350,
  SHARED: 250
};

// Lista completa de carreras
export const CAREERS = [
  'Ingeniería Civil',
  'Ingeniería de Sistemas',
  'Ingeniería Industrial',
  'Ingeniería Eléctrica',
  'Ingeniería Mecánica',
  'Ingeniería Electrónica',
  'Ingeniería Química',
  'Ingeniería Ambiental',
  'Ingeniería en Telecomunicaciones',
  'Ingeniería en Redes',
  'Ingeniería en Computación',
  'Arquitectura'
];

// Lista completa de semestres del 1ro al 10mo
export const SEMESTERS = [
  'Primer',
  'Segundo', 
  'Tercer',
  'Cuarto',
  'Quinto',
  'Sexto',
  'Séptimo',
  'Octavo',
  'Noveno',
  'Décimo'
];

// Función para convertir semestre texto a número
export const getSemesterNumber = (semesterText) => {
  const semestres = {
    'Primer': 1, 'Segundo': 2, 'Tercer': 3, 'Cuarto': 4,
    'Quinto': 5, 'Sexto': 6, 'Séptimo': 7, 'Octavo': 8,
    'Noveno': 9, 'Décimo': 10, 'Decimo': 10
  };
  return semestres[semesterText] || semesterText;
};

// Función para convertir número a texto de semestre
export const getSemesterText = (semesterNumber) => {
  const semestres = {
    1: 'Primer', 2: 'Segundo', 3: 'Tercer', 4: 'Cuarto',
    5: 'Quinto', 6: 'Sexto', 7: 'Séptimo', 8: 'Octavo',
    9: 'Noveno', 10: 'Décimo'
  };
  return semestres[semesterNumber] || semesterNumber;
};

export const INITIAL_ROOM_DATA = {};
export const INITIAL_ADMIN_ROOM_DATA = {};

// Animaciones
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

export const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

// Funciones de utilidad
export const calculateStudentDebt = (student, roomType) => {
  if (!student.paymentHistory) return 0;
  
  let debt = 0;
  const monthlyFee = roomType === 'INDIVIDUAL' ? ROOM_PRICES.INDIVIDUAL : ROOM_PRICES.SHARED;
  
  Object.values(student.paymentHistory).forEach(year => {
    Object.values(year).forEach(month => {
      if (month.status === PAYMENT_STATUS.PENDIENTE || month.status === PAYMENT_STATUS.MOROSO) {
        debt += monthlyFee;
      }
    });
  });
  
  return debt;
};

export const countPendingMonths = (student, year) => {
  if (!student.paymentHistory || !student.paymentHistory[year]) return 0;
  
  return Object.values(student.paymentHistory[year]).filter(month => 
    month.status === PAYMENT_STATUS.PENDIENTE || month.status === PAYMENT_STATUS.MOROSO
  ).length;
};

export const getGlobalRoomNumber = (floor, side, roomNumber) => {
  const floorOffset = {
    'Piso 1': 0,
    'Piso 2': 14,
    'Piso 3': 28,
    'Piso 4': 42
  };
  
  const sideOffset = side === 'Izquierda' ? 0 : 7;
  return floorOffset[floor] + sideOffset + roomNumber;
};