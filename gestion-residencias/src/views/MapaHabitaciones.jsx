import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { FiSun, FiMoon, FiPlus, FiMinus, FiX, FiSave, FiUser, FiHome, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight, FiDownload } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";
import loaderImage from '../assets/images.png';
import VideoFondo from "../components/VideoFondo";
import QRCode from "react-qr-code";
import img1 from '../assets/1.jpg';
import img2 from '../assets/2.jpg';
import img3 from '../assets/3.jpg';
import img4 from '../assets/4.jpg';

// Constantes para tipos de habitación
const ROOM_TYPES = {
  INDIVIDUAL: "Individual",
  SHARED: "Compartido"
};

const ADMIN_ROOM_TYPES = {
  INDIVIDUAL: "Individual",
  SHARED: "Compartido"
};

// Pisos disponibles
const FLOORS = [
  { id: 3, name: "P2" },
  { id: 2, name: "P1" },
  { id: 1, name: "PB" },
];

const ADMIN_FLOORS = [
  { id: 1, name: "PB" },
  { id: 2, name: "P1" }
];

// Lados del edificio
const SIDES = ["Izquierdo", "Derecho"];
const ROOMS_PER_SIDE = 7;

const ADMIN_SIDES = ["Izquierdo", "Derecho"];
const ADMIN_ROOMS_PER_SIDE = 5;

// Datos iniciales de ejemplo
const INITIAL_ROOM_DATA = {
  "Damas-PB-Izquierdo-1": {
    students: [
      {
        id: "stu-001",
        name: "Juan Pérez",
        semester: "3er Semestre",
        photo: "",
        assets: [
          { id: "ast-001", name: "Catre", code: "A001" },
          { id: "ast-002", name: "Escritorio", code: "A002" },
          { id: "ast-003", name: "Ropero", code: "A003" },
        ],
      },
    ],
  },
  "Varones-PB-Derecho-2": {
    students: [
      {
        id: "stu-002",
        name: "María López",
        semester: "5to Semestre",
        photo: "",
        assets: [
          { id: "ast-004", name: "Catre", code: "A001" },
          { id: "ast-005", name: "Ropero", code: "A003" },
        ],
      },
      {
        id: "stu-003",
        name: "Carlos Gómez",
        semester: "2do Semestre",
        photo: "",
        assets: [
          { id: "ast-006", name: "Mesa", code: "A010" },
          { id: "ast-007", name: "Silla", code: "A011" },
        ],
      },
    ],
  },
};

const INITIAL_ADMIN_ROOM_DATA = {
  "Admin-PB-Izquierdo-1": {
    staff: [
      {
        id: "staff-001",
        name: "Carlos Mendoza",
        position: "Administrador",
        department: "Dirección",
        photo: "",
        assets: [
          { id: "ast-101", name: "Escritorio", code: "AD001" },
          { id: "ast-102", name: "Silla", code: "AD002" }
        ]
      }
    ]
  },
  "Military-P1-Derecho-2": {
    staff: [
      {
        id: "mil-001",
        name: "Teniente Pérez",
        position: "Oficial",
        department: "Seguridad",
        photo: "",
        assets: [
          { id: "ast-201", name: "Armario", code: "MIL001" },
          { id: "ast-202", name: "Cama", code: "MIL002" }
        ]
      }
    ]
  }
};

// Animaciones
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3 } },
  exit: { y: 20, opacity: 0, transition: { duration: 0.2 } }
};

const RoomMap = () => {
  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [roomsStatus, setRoomsStatus] = useState({
    "Damas-PB-Izquierdo-1": true,
    "Varones-PB-Derecho-2": true,
  });
  const [adminRoomsStatus, setAdminRoomsStatus] = useState({
    "Admin-PB-Izquierdo-1": true,
    "Military-P1-Derecho-2": true,
  });
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [roomsData, setRoomsData] = useState(INITIAL_ROOM_DATA);
  const [adminRoomsData, setAdminRoomsData] = useState(INITIAL_ADMIN_ROOM_DATA);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedAdminRoom, setSelectedAdminRoom] = useState(null);
  const [studentsForm, setStudentsForm] = useState([]);
  const [staffForm, setStaffForm] = useState([]);
  const [videoOpacity, setVideoOpacity] = useState(0.3);
  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState('estudiantes-section');
  const images = [img1, img2, img3, img4];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Efecto para persistir el modo oscuro
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Efecto para simular carga inicial
  useEffect(() => {
    const loadingTimer = setTimeout(() => {
      setShowLoader(false);
      setTimeout(() => setIsLoading(false), 500);
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Efecto para simular carga al seleccionar habitación
  useEffect(() => {
    if (selectedRoom || selectedAdminRoom) {
      setIsLoading(true);
      setShowLoader(true);
      const timer = setTimeout(() => {
        setShowLoader(false);
        setTimeout(() => setIsLoading(false), 500);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedRoom, selectedAdminRoom]);

  // Efecto para detectar la sección visible
  useEffect(() => {
    const handleScroll = () => {
      const estudiantesSection = document.getElementById('estudiantes-section');
      const personalSection = document.getElementById('personal-section');
      
      if (estudiantesSection && personalSection) {
        const estudiantesPosition = estudiantesSection.getBoundingClientRect();
        const personalPosition = personalSection.getBoundingClientRect();
        
        if (personalPosition.top <= 100) {
          setActiveSection('personal-section');
        } else if (estudiantesPosition.top <= 100) {
          setActiveSection('estudiantes-section');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hotkeys para accesibilidad
  useHotkeys('ctrl+d', () => toggleDarkMode());
  useHotkeys('esc', () => {
    setSelectedRoom(null);
    setSelectedAdminRoom(null);
  });

  // Función para desplazarse a secciones
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
    }
  };

  // Navegación de imágenes
  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Calcula estadísticas de ocupación
  const calculateStats = useCallback((type) => {
    const typeRooms = Object.keys(roomsStatus).filter(id => id.startsWith(type));
    const totalRooms = FLOORS.length * SIDES.length * ROOMS_PER_SIDE;
    const occupiedRooms = typeRooms.filter(id => roomsStatus[id]).length;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);
    
    return {
      totalRooms,
      occupiedRooms,
      occupancyRate,
      availableRooms: totalRooms - occupiedRooms
    };
  }, [roomsStatus]);

  const calculateAdminStats = useCallback((type) => {
    const typeRooms = Object.keys(adminRoomsStatus).filter(id => id.startsWith(type));
    const totalRooms = ADMIN_FLOORS.length * ADMIN_SIDES.length * ADMIN_ROOMS_PER_SIDE;
    const occupiedRooms = typeRooms.filter(id => adminRoomsStatus[id]).length;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);
    
    return {
      totalRooms,
      occupiedRooms,
      occupancyRate,
      availableRooms: totalRooms - occupiedRooms
    };
  }, [adminRoomsStatus]);

  const womenStats = calculateStats("Damas");
  const menStats = calculateStats("Varones");
  const adminStats = calculateAdminStats("Admin");
  const militaryStats = calculateAdminStats("Military");

  // Prepara el formulario cuando se selecciona una habitación
  useEffect(() => {
    if (selectedRoom) {
      const data = roomsData[selectedRoom.id];
      const maxStudents = selectedRoom.type === ROOM_TYPES.SHARED ? 3 : 2;

      const studentsData = data?.students || [];
      const newStudents = [];

      for (let i = 0; i < maxStudents; i++) {
        newStudents.push(
          studentsData[i] || {
            id: `temp-${Date.now()}-${i}`,
            name: "",
            semester: "",
            photo: "",
            assets: [
              { id: `temp-asset-${Date.now()}-${i}-0`, name: "", code: "" },
              { id: `temp-asset-${Date.now()}-${i}-1`, name: "", code: "" },
              { id: `temp-asset-${Date.now()}-${i}-2`, name: "", code: "" },
            ],
          }
        );
      }
      setStudentsForm(newStudents);
    }
  }, [selectedRoom, roomsData]);

  useEffect(() => {
    if (selectedAdminRoom) {
      const data = adminRoomsData[selectedAdminRoom.id];
      const maxStaff = selectedAdminRoom.type === ADMIN_ROOM_TYPES.SHARED ? 2 : 1;

      const staffData = data?.staff || [];
      const newStaff = [];

      for (let i = 0; i < maxStaff; i++) {
        newStaff.push(
          staffData[i] || {
            id: `temp-staff-${Date.now()}-${i}`,
            name: "",
            position: "",
            department: "",
            photo: "",
            assets: [
              { id: `temp-asset-${Date.now()}-${i}-0`, name: "", code: "" },
              { id: `temp-asset-${Date.now()}-${i}-1`, name: "", code: "" }
            ]
          }
        );
      }
      setStaffForm(newStaff);
    }
  }, [selectedAdminRoom, adminRoomsData]);

  // Genera un ID global para la habitación
  const getGlobalRoomNumber = (floorName, side, localNumber) => {
    const sideOffset = side === "Izquierdo" ? 1 : 8;
    return `${floorName}-${sideOffset + localNumber - 1}`;
  };

  // Alternar estado ocupado/disponible
  const toggleOccupied = (id) => {
    setRoomsStatus(prev => ({ ...prev, [id]: !prev[id] }));
    toast.success(`Habitación ${!roomsStatus[id] ? 'marcada como ocupada' : 'marcada como disponible'}`);
  };

  const toggleAdminOccupied = (id) => {
    setAdminRoomsStatus(prev => ({ ...prev, [id]: !prev[id] }));
    toast.success(`Habitación ${!adminRoomsStatus[id] ? 'marcada como ocupada' : 'marcada como disponible'}`);
  };

  // Vaciar información de la habitación
  const clearRoomData = (roomId) => {
    setRoomsData(prev => ({
      ...prev,
      [roomId]: {
        students: []
      }
    }));
    setRoomsStatus(prev => ({ ...prev, [roomId]: true }));
    toast.success("Información de la habitación vaciada");
    
    if (selectedRoom && selectedRoom.id === roomId) {
      const maxStudents = selectedRoom.type === ROOM_TYPES.SHARED ? 3 : 2;
      const emptyStudents = Array(maxStudents).fill().map((_, i) => ({
        id: `temp-${Date.now()}-${i}`,
        name: "",
        semester: "",
        photo: "",
        assets: [
          { id: `temp-asset-${Date.now()}-${i}-0`, name: "", code: "" },
          { id: `temp-asset-${Date.now()}-${i}-1`, name: "", code: "" },
          { id: `temp-asset-${Date.now()}-${i}-2`, name: "", code: "" },
        ],
      }));
      setStudentsForm(emptyStudents);
    }
  };

  const clearAdminRoomData = (roomId) => {
    setAdminRoomsData(prev => ({
      ...prev,
      [roomId]: {
        staff: []
      }
    }));
    setAdminRoomsStatus(prev => ({ ...prev, [roomId]: true }));
    toast.success("Información de la habitación vaciada");
    
    if (selectedAdminRoom && selectedAdminRoom.id === roomId) {
      const maxStaff = selectedAdminRoom.type === ADMIN_ROOM_TYPES.SHARED ? 2 : 1;
      const emptyStaff = Array(maxStaff).fill().map((_, i) => ({
        id: `temp-staff-${Date.now()}-${i}`,
        name: "",
        position: "",
        department: "",
        photo: "",
        assets: [
          { id: `temp-asset-${Date.now()}-${i}-0`, name: "", code: "" },
          { id: `temp-asset-${Date.now()}-${i}-1`, name: "", code: "" }
        ]
      }));
      setStaffForm(emptyStaff);
    }
  };

  // Alternar modo oscuro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast(`Modo ${!darkMode ? 'oscuro' : 'claro'} activado`, {
      icon: !darkMode ? <FiMoon /> : <FiSun />,
    });
  };

  // Manejar cambios en el formulario
  const handleInputChange = (index, field, value) => {
    setStudentsForm(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleStaffInputChange = (index, field, value) => {
    setStaffForm(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Manejar cambios en los activos
  const handleAssetChange = (studentIndex, assetIndex, field, value) => {
    setStudentsForm(prev => {
      const updated = [...prev];
      const currentAssets = updated[studentIndex].assets || [];
      const updatedAssets = [...currentAssets];
      
      if (!updatedAssets[assetIndex]) {
        updatedAssets[assetIndex] = { id: `temp-asset-${Date.now()}`, name: "", code: "" };
      }
      
      updatedAssets[assetIndex] = {
        ...updatedAssets[assetIndex],
        [field]: value,
      };
      
      updated[studentIndex].assets = updatedAssets;
      return updated;
    });
  };

  const handleStaffAssetChange = (staffIndex, assetIndex, field, value) => {
    setStaffForm(prev => {
      const updated = [...prev];
      const currentAssets = updated[staffIndex].assets || [];
      const updatedAssets = [...currentAssets];
      
      if (!updatedAssets[assetIndex]) {
        updatedAssets[assetIndex] = { id: `temp-asset-${Date.now()}`, name: "", code: "" };
      }
      
      updatedAssets[assetIndex] = {
        ...updatedAssets[assetIndex],
        [field]: value,
      };
      
      updated[staffIndex].assets = updatedAssets;
      return updated;
    });
  };

  // Manejar cambio de foto
  const handlePhotoChange = (index, file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      handleInputChange(index, "photo", reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleStaffPhotoChange = (index, file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      handleStaffInputChange(index, "photo", reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Agregar nuevo activo
  const addAsset = (studentIndex) => {
    setStudentsForm(prev => {
      const updated = [...prev];
      updated[studentIndex].assets = [
        ...updated[studentIndex].assets,
        { id: `new-asset-${Date.now()}`, name: "", code: "" }
      ];
      return updated;
    });
  };

  const addStaffAsset = (staffIndex) => {
    setStaffForm(prev => {
      const updated = [...prev];
      updated[staffIndex].assets = [
        ...updated[staffIndex].assets,
        { id: `new-asset-${Date.now()}`, name: "", code: "" }
      ];
      return updated;
    });
  };

  // Eliminar activo
  const removeAsset = (studentIndex, assetIndex) => {
    setStudentsForm(prev => {
      const updated = [...prev];
      updated[studentIndex].assets = updated[studentIndex].assets.filter((_, i) => i !== assetIndex);
      return updated;
    });
  };

  const removeStaffAsset = (staffIndex, assetIndex) => {
    setStaffForm(prev => {
      const updated = [...prev];
      updated[staffIndex].assets = updated[staffIndex].assets.filter((_, i) => i !== assetIndex);
      return updated;
    });
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowLoader(true);

    const validStudents = studentsForm.filter(
      student => student.name.trim() !== "" && student.semester.trim() !== ""
    );

    if (validStudents.length === 0 && !roomsStatus[selectedRoom.id]) {
      toast.error("Por favor marca la habitación como ocupada o ingresa al menos un estudiante");
      setShowLoader(false);
      setIsLoading(false);
      return;
    }

    const studentsWithValidAssets = validStudents.map(student => ({
      ...student,
      assets: (student.assets || []).filter(asset => asset.name.trim() !== "")
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    setRoomsData(prev => ({
      ...prev,
      [selectedRoom.id]: {
        students: studentsWithValidAssets,
      },
    }));

    if (validStudents.length > 0) {
      setRoomsStatus(prev => ({ ...prev, [selectedRoom.id]: true }));
    }
    
    toast.success("Información de la habitación guardada exitosamente!");
    
    setShowLoader(false);
    setTimeout(() => {
      setIsLoading(false);
      setSelectedRoom(null);
    }, 500);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowLoader(true);

    const validStaff = staffForm.filter(
      staff => staff.name.trim() !== "" && staff.position.trim() !== "" && staff.department.trim() !== ""
    );

    if (validStaff.length === 0 && !adminRoomsStatus[selectedAdminRoom.id]) {
      toast.error("Por favor marca la habitación como ocupada o ingresa al menos un miembro del personal");
      setShowLoader(false);
      setIsLoading(false);
      return;
    }

    const staffWithValidAssets = validStaff.map(staff => ({
      ...staff,
      assets: (staff.assets || []).filter(asset => asset.name.trim() !== "")
    }));

    await new Promise(resolve => setTimeout(resolve, 1000));

    setAdminRoomsData(prev => ({
      ...prev,
      [selectedAdminRoom.id]: {
        staff: staffWithValidAssets,
      },
    }));

    if (validStaff.length > 0) {
      setAdminRoomsStatus(prev => ({ ...prev, [selectedAdminRoom.id]: true }));
    }
    
    toast.success("Información de la habitación guardada exitosamente!");
    
    setShowLoader(false);
    setTimeout(() => {
      setIsLoading(false);
      setSelectedAdminRoom(null);
    }, 500);
  };

  // Generar QR para habitación
  const generateRoomQR = (roomId) => {
    return JSON.stringify({
      roomId,
      building: roomId.split('-')[0],
      floor: roomId.split('-')[1],
      side: roomId.split('-')[2],
      number: roomId.split('-')[3],
      status: roomsStatus[roomId] ? "Ocupado" : "Disponible",
      lastUpdated: new Date().toISOString()
    });
  };

  const generateAdminRoomQR = (roomId) => {
    return JSON.stringify({
      roomId,
      building: roomId.split('-')[0],
      floor: roomId.split('-')[1],
      side: roomId.split('-')[2],
      number: roomId.split('-')[3],
      status: adminRoomsStatus[roomId] ? "Ocupado" : "Disponible",
      lastUpdated: new Date().toISOString()
    });
  };

  // Descargar QR
  const handleDownloadQR = () => {
    const svg = document.querySelector('.QRCode svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-Habitacion-${selectedRoom.label}-${selectedRoom.number}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const handleDownloadAdminQR = () => {
    const svg = document.querySelector('.AdminQRCode svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-Habitacion-${selectedAdminRoom.label}-${selectedAdminRoom.number}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  // Clases condicionales para modo oscuro
  const themeClasses = {
    bg: darkMode ? "bg-gray-900" : "bg-blue-50",
    text: darkMode ? "text-gray-100" : "text-blue-900",
    cardBg: darkMode ? "bg-gray-800" : "bg-white",
    cardBorder: darkMode ? "border-gray-700" : "border-blue-200",
    modalBg: darkMode ? "bg-gray-800" : "bg-white",
    inputBg: darkMode ? "bg-gray-700 text-white" : "bg-white",
    inputBorder: darkMode ? "border-gray-600" : "border-blue-300",
    statsBg: darkMode ? "bg-gray-700" : "bg-blue-50",
    statsText: darkMode ? "text-gray-100" : "text-blue-800",
    womenColor: darkMode ? "pink-400" : "pink-600",
    menColor: darkMode ? "blue-400" : "blue-600",
    adminColor: darkMode ? "green-400" : "green-600",
    militaryColor: darkMode ? "purple-400" : "purple-600"
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} p-4 md:p-6 relative transition-colors duration-300 overflow-hidden`}>
      {/* Notificaciones */}
      <Toaster position="top-right" toastOptions={{
        className: darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800',
      }} />

      {/* Video de fondo */}
      <VideoFondo 
        src="../assets/resifondo.mp4" 
        opacity={videoOpacity} 
        overlayOpacity={0.3}
        playbackRate={0.7}
      />

      {/* Sidebar de navegación */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-50 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => scrollToSection('estudiantes-section')}
          className={`p-3 rounded-full shadow-lg flex items-center justify-center ${
            activeSection === 'estudiantes-section' 
              ? darkMode 
                ? 'bg-yellow-500 text-gray-900' 
                : 'bg-yellow-400 text-white'
              : darkMode 
                ? 'bg-gray-700 text-white' 
                : 'bg-white text-gray-800'
          }`}
          title="Habitaciones de Estudiantes"
        >
          <FiHome className="h-5 w-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => scrollToSection('personal-section')}
          className={`p-3 rounded-full shadow-lg flex items-center justify-center ${
            activeSection === 'personal-section' 
              ? darkMode 
                ? 'bg-yellow-500 text-gray-900' 
                : 'bg-yellow-400 text-white'
              : darkMode 
                ? 'bg-gray-700 text-white' 
                : 'bg-white text-gray-800'
          }`}
          title="Habitaciones de Personal"
        >
          <FiUser className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Controles de interfaz */}
      <div className="fixed right-20 top-4 z-50 flex gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setVideoOpacity(prev => Math.min(prev + 0.1, 0.7))}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} shadow-md`}
          title="Aumentar opacidad del fondo"
        >
          <FiPlus className="h-5 w-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setVideoOpacity(prev => Math.max(prev - 0.1, 0.1))}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-800'} shadow-md`}
          title="Reducir opacidad del fondo"
        >
          <FiMinus className="h-5 w-5" />
        </motion.button>
      </div>

      {/* Botón modo oscuro */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleDarkMode}
        className={`fixed right-4 top-4 z-50 p-2 rounded-full shadow-lg ${darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-800 text-white'}`}
        title={darkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      >
        {darkMode ? <FiSun className="h-6 w-6" /> : <FiMoon className="h-6 w-6" />}
      </motion.button>

      {/* Loader */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            className={`fixed inset-0 ${darkMode ? 'bg-gray-900' : 'bg-white'} bg-opacity-90 flex items-center justify-center z-40`}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
          >
            <div className="text-center">
              <motion.img 
                src={loaderImage} 
                alt="Cargando..." 
                className="mx-auto h-24 sm:h-32 w-24 sm:w-32"
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1.5, repeat: Infinity }
                }}
              />
              <motion.p 
                className={`mt-4 font-semibold ${darkMode ? 'text-yellow-400' : 'text-blue-800'}`}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Cargando residencias...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenido principal */}
      <div 
        className="relative z-10" 
        style={{ 
          backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.85)' : 'rgba(239, 246, 255, 0.85)',
          borderRadius: '1rem',
          padding: '1.5rem'
        }}
      >
        {/* Encabezado */}
        <div className="mb-6 md:mb-8 text-center">
          <motion.h2 
            className={`text-2xl md:text-3xl font-bold ${themeClasses.text} mb-2`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Mapa de Habitaciones de Estudiantes
          </motion.h2>
          <motion.div 
            className={`h-1 w-20 md:w-24 ${darkMode ? 'bg-yellow-500' : 'bg-yellow-500'} mx-auto`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
          
          {/* Carrusel de imágenes */}
          <motion.div 
            className="mt-8 mb-8 mx-auto max-w-4xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className={`text-xl font-semibold ${themeClasses.text} mb-4 text-center`}>
              Instalaciones de la Residencia
            </h3>
            
            <div className="relative group">
              <div className="overflow-hidden rounded-xl shadow-2xl">
                <motion.img
                  key={currentImageIndex}
                  src={images[currentImageIndex]}
                  alt={`Instalación ${currentImageIndex + 1}`}
                  className="w-full h-64 md:h-96 object-cover"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Imagen anterior"
              >
                <FiChevronLeft size={24} />
              </button>
              
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-label="Siguiente imagen"
              >
                <FiChevronRight size={24} />
              </button>
              
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${currentImageIndex === index ? 'bg-white w-6' : 'bg-white/50'}`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            <p className={`text-center mt-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {['Piscina', 'Habitacion Individual', 'Habitacion Compartida', 'Habitacion Individual'][currentImageIndex]}
            </p>
          </motion.div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-w-5xl mx-auto">
            <motion.div 
              className={`${themeClasses.cardBg} p-4 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-pink-200'}`}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-pink-300' : 'text-pink-700'} mb-3`}>Estadísticas Damas</h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-pink-50'} p-2 rounded-lg`}>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-pink-200' : 'text-pink-600'}`}>Total</p>
                  <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-pink-100' : 'text-pink-800'}`}>{womenStats.totalRooms}</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-pink-50'} p-2 rounded-lg`}>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-pink-200' : 'text-pink-600'}`}>Ocupadas</p>
                  <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-pink-100' : 'text-pink-800'}`}>{womenStats.occupiedRooms}</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-pink-50'} p-2 rounded-lg`}>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-pink-200' : 'text-pink-600'}`}>Disponibles</p>
                  <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-pink-100' : 'text-pink-800'}`}>{womenStats.availableRooms}</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-pink-50'} p-2 rounded-lg`}>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-pink-200' : 'text-pink-600'}`}>Ocupación</p>
                  <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-pink-100' : 'text-pink-800'}`}>{womenStats.occupancyRate}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className={`${themeClasses.cardBg} p-4 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-blue-200'}`}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-3`}>Estadísticas Varones</h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-2 rounded-lg`}>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>Total</p>
                  <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-blue-100' : 'text-blue-800'}`}>{menStats.totalRooms}</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-2 rounded-lg`}>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>Ocupadas</p>
                  <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-blue-100' : 'text-blue-800'}`}>{menStats.occupiedRooms}</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-2 rounded-lg`}>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>Disponibles</p>
                  <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-blue-100' : 'text-blue-800'}`}>{menStats.availableRooms}</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-2 rounded-lg`}>
                  <p className={`text-xs md:text-sm ${darkMode ? 'text-blue-200' : 'text-blue-600'}`}>Ocupación</p>
                  <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-blue-100' : 'text-blue-800'}`}>{menStats.occupancyRate}%</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Mapa de habitaciones de estudiantes */}
        <motion.div 
          id="estudiantes-section"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {[
            { title: "Edificio Damas", type: "Damas", color: themeClasses.womenColor }, 
            { title: "Edificio Varones", type: "Varones", color: themeClasses.menColor }
          ].map((building) => (
            <motion.div
              key={building.title}
              className={`${themeClasses.cardBg} p-4 md:p-6 rounded-xl shadow-md ${themeClasses.cardBorder}`}
              variants={slideUp}
            >
              <div className="flex items-center mb-4 md:mb-6">
                <div className={`h-6 md:h-8 w-1 ${darkMode ? 'bg-yellow-500' : 'bg-yellow-500'} mr-2 md:mr-3 rounded-full`}></div>
                <h3 className={`text-lg md:text-xl font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  {building.title}
                </h3>
              </div>

              {FLOORS.map((floor) => (
                <div key={floor.id} className="mb-4 md:mb-6">
                  <h4 className={`${darkMode ? 'text-blue-300' : 'text-blue-700'} font-medium mb-2 md:mb-3 flex items-center`}>
                    <span className={`inline-block w-2 h-4 md:h-6 ${darkMode ? 'bg-blue-400' : 'bg-blue-600'} mr-2 rounded-full`}></span>
                    {floor.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {SIDES.map((side) => {
                      let counter = 1;
                      return (
                        <div key={side}>
                          <h5 className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm md:text-base font-medium mb-1 md:mb-2`}>{side}</h5>
                          <div className="flex flex-wrap gap-2 md:gap-3">
                            {Array.from({ length: ROOMS_PER_SIDE }).map((_, i) => {
                              const roomType = i < 4 ? ROOM_TYPES.INDIVIDUAL : ROOM_TYPES.SHARED;
                              const roomId = `${building.type}-${floor.name}-${side}-${counter}`;
                              const isOccupied = roomsStatus[roomId];
                              const roomNumber = counter++;
                              const occupantsCount = roomsData[roomId]?.students?.length || 0;
                              const globalNumber = getGlobalRoomNumber(floor.name, side, roomNumber);
                              
                              let bgColor = "";
                              if (isOccupied) {
                                bgColor = darkMode ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600";
                              } else {
                                bgColor = building.type === "Damas" 
                                  ? darkMode 
                                    ? "bg-pink-800 hover:bg-pink-700" 
                                    : "bg-pink-200 hover:bg-pink-300" 
                                  : darkMode 
                                    ? "bg-blue-800 hover:bg-blue-700" 
                                    : "bg-blue-200 hover:bg-blue-300";
                              }

                              return (
                                <motion.button
                                  key={roomId}
                                  type="button"
                                  onClick={() => setSelectedRoom({
                                    id: roomId,
                                    type: roomType,
                                    label: `${building.type}-${floor.name}`,
                                    number: roomNumber,
                                  })}
                                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all relative
                                  ${bgColor} 
                                  ${isOccupied 
                                    ? darkMode 
                                      ? 'border-red-800' 
                                      : 'border-red-700' 
                                    : building.type === "Damas" 
                                      ? darkMode 
                                        ? 'border-pink-600' 
                                        : 'border-pink-400' 
                                      : darkMode 
                                        ? 'border-blue-600' 
                                        : 'border-blue-400'}
                                  hover:shadow-md hover:ring-1 md:hover:ring-2 ${darkMode ? 'hover:ring-yellow-500' : 'hover:ring-yellow-400'}`}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {isOccupied && occupantsCount > 0 && (
                                    <motion.span 
                                      className={`absolute -top-1 -right-1 ${darkMode ? 'bg-yellow-600' : 'bg-yellow-500'} text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center`}
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                    >
                                      {occupantsCount}
                                    </motion.span>
                                  )}
                                  <span className={`text-[10px] sm:text-xs ${isOccupied ? 'text-white' : darkMode ? 'text-gray-100' : 'text-black'}`}>
                                    {globalNumber}
                                  </span>
                                  <span className={`text-[8px] sm:text-[10px] mt-0.5 opacity-80 ${isOccupied ? 'text-white' : darkMode ? 'text-gray-300' : 'text-black'}`}>
                                    {roomType === ROOM_TYPES.SHARED ? "(C)" : "(I)"}
                                  </span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>

        {/* Sección de Habitaciones de Personal Administrativo y Militares */}
        <div className="mt-12 mb-6 md:mb-8 text-center">
          <motion.h2 
            className={`text-2xl md:text-3xl font-bold ${themeClasses.text} mb-2`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Mapa de Habitaciones de Personal Administrativo y Militares
          </motion.h2>
          <motion.div 
            className={`h-1 w-20 md:w-24 ${darkMode ? 'bg-yellow-500' : 'bg-yellow-500'} mx-auto`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />
        </div>

        {/* Estadísticas Administrativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 max-w-5xl mx-auto">
          <motion.div 
            className={`${themeClasses.cardBg} p-4 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-green-200'}`}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-green-300' : 'text-green-700'} mb-3`}>Estadísticas Administrativas</h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-green-50'} p-2 rounded-lg`}>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-green-200' : 'text-green-600'}`}>Total</p>
                <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-green-100' : 'text-green-800'}`}>{adminStats.totalRooms}</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-green-50'} p-2 rounded-lg`}>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-green-200' : 'text-green-600'}`}>Ocupadas</p>
                <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-green-100' : 'text-green-800'}`}>{adminStats.occupiedRooms}</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-green-50'} p-2 rounded-lg`}>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-green-200' : 'text-green-600'}`}>Disponibles</p>
                <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-green-100' : 'text-green-800'}`}>{adminStats.availableRooms}</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-green-50'} p-2 rounded-lg`}>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-green-200' : 'text-green-600'}`}>Ocupación</p>
                <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-green-100' : 'text-green-800'}`}>{adminStats.occupancyRate}%</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className={`${themeClasses.cardBg} p-4 rounded-lg shadow-sm ${darkMode ? 'border-gray-700' : 'border-purple-200'}`}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-purple-300' : 'text-purple-700'} mb-3`}>Estadísticas Militares</h3>
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-purple-50'} p-2 rounded-lg`}>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>Total</p>
                <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-purple-100' : 'text-purple-800'}`}>{militaryStats.totalRooms}</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-purple-50'} p-2 rounded-lg`}>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>Ocupadas</p>
                <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-purple-100' : 'text-purple-800'}`}>{militaryStats.occupiedRooms}</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-purple-50'} p-2 rounded-lg`}>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>Disponibles</p>
                <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-purple-100' : 'text-purple-800'}`}>{militaryStats.availableRooms}</p>
              </div>
              <div className={`${darkMode ? 'bg-gray-700' : 'bg-purple-50'} p-2 rounded-lg`}>
                <p className={`text-xs md:text-sm ${darkMode ? 'text-purple-200' : 'text-purple-600'}`}>Ocupación</p>
                <p className={`text-lg md:text-xl font-bold ${darkMode ? 'text-purple-100' : 'text-purple-800'}`}>{militaryStats.occupancyRate}%</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mapa de habitaciones administrativas */}
        <motion.div 
          id="personal-section"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {[
            { title: "Edificio Administrativo", type: "Admin", color: themeClasses.adminColor }, 
            { title: "Edificio Militar", type: "Military", color: themeClasses.militaryColor }
          ].map((building) => (
            <motion.div
              key={building.title}
              className={`${themeClasses.cardBg} p-4 md:p-6 rounded-xl shadow-md ${themeClasses.cardBorder}`}
              variants={slideUp}
            >
              <div className="flex items-center mb-4 md:mb-6">
                <div className={`h-6 md:h-8 w-1 ${darkMode ? 'bg-yellow-500' : 'bg-yellow-500'} mr-2 md:mr-3 rounded-full`}></div>
                <h3 className={`text-lg md:text-xl font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  {building.title}
                </h3>
              </div>

              {ADMIN_FLOORS.map((floor) => (
                <div key={floor.id} className="mb-4 md:mb-6">
                  <h4 className={`${darkMode ? 'text-blue-300' : 'text-blue-700'} font-medium mb-2 md:mb-3 flex items-center`}>
                    <span className={`inline-block w-2 h-4 md:h-6 ${darkMode ? 'bg-blue-400' : 'bg-blue-600'} mr-2 rounded-full`}></span>
                    {floor.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 md:gap-4">
                    {ADMIN_SIDES.map((side) => {
                      let counter = 1;
                      return (
                        <div key={side}>
                          <h5 className={`${darkMode ? 'text-gray-300' : 'text-gray-700'} text-sm md:text-base font-medium mb-1 md:mb-2`}>{side}</h5>
                          <div className="flex flex-wrap gap-2 md:gap-3">
                            {Array.from({ length: ADMIN_ROOMS_PER_SIDE }).map((_, i) => {
                              const roomType = i < 3 ? ADMIN_ROOM_TYPES.INDIVIDUAL : ADMIN_ROOM_TYPES.SHARED;
                              const roomId = `${building.type}-${floor.name}-${side}-${counter}`;
                              const isOccupied = adminRoomsStatus[roomId];
                              const roomNumber = counter++;
                              const staffCount = adminRoomsData[roomId]?.staff?.length || 0;
                              const globalNumber = getGlobalRoomNumber(floor.name, side, roomNumber);
                              
                              let bgColor = "";
                              if (isOccupied) {
                                bgColor = darkMode ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600";
                              } else {
                                bgColor = building.type === "Admin" 
                                  ? darkMode 
                                    ? "bg-green-800 hover:bg-green-700" 
                                    : "bg-green-200 hover:bg-green-300" 
                                  : darkMode 
                                    ? "bg-purple-800 hover:bg-purple-700" 
                                    : "bg-purple-200 hover:bg-purple-300";
                              }

                              return (
                                <motion.button
                                  key={roomId}
                                  type="button"
                                  onClick={() => setSelectedAdminRoom({
                                    id: roomId,
                                    type: roomType,
                                    label: `${building.type}-${floor.name}`,
                                    number: roomNumber,
                                  })}
                                  className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 border rounded-lg flex flex-col items-center justify-center text-xs font-semibold transition-all relative
                                  ${bgColor} 
                                  ${isOccupied 
                                    ? darkMode 
                                      ? 'border-red-800' 
                                      : 'border-red-700' 
                                    : building.type === "Admin" 
                                      ? darkMode 
                                        ? 'border-green-600' 
                                        : 'border-green-400' 
                                      : darkMode 
                                        ? 'border-purple-600' 
                                        : 'border-purple-400'}
                                  hover:shadow-md hover:ring-1 md:hover:ring-2 ${darkMode ? 'hover:ring-yellow-500' : 'hover:ring-yellow-400'}`}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {isOccupied && staffCount > 0 && (
                                    <motion.span 
                                      className={`absolute -top-1 -right-1 ${darkMode ? 'bg-yellow-600' : 'bg-yellow-500'} text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center`}
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                    >
                                      {staffCount}
                                    </motion.span>
                                  )}
                                  <span className={`text-[10px] sm:text-xs ${isOccupied ? 'text-white' : darkMode ? 'text-gray-100' : 'text-black'}`}>
                                    {globalNumber}
                                  </span>
                                  <span className={`text-[8px] sm:text-[10px] mt-0.5 opacity-80 ${isOccupied ? 'text-white' : darkMode ? 'text-gray-300' : 'text-black'}`}>
                                    {roomType === ADMIN_ROOM_TYPES.SHARED ? "(C)" : "(I)"}
                                  </span>
                                </motion.button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </motion.div>
          ))}
        </motion.div>

        {/* Modal de habitación de estudiantes */}
        <AnimatePresence>
          {selectedRoom && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className={`${themeClasses.modalBg} rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto`}
                style={{ borderTop: "4px solid #F59E0B" }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
              >
                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div>
                      <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-blue-900'}`}>
                        Información del Cuarto
                        {editMode && <span className="text-sm ml-2 text-yellow-600">(Editando)</span>}
                      </h2>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 md:gap-x-4 md:gap-y-2 mt-1 md:mt-2">
                        <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                          <span className="font-medium">Número:</span>{" "}
                          <span className="font-semibold">
                            {selectedRoom.label}-{selectedRoom.number}
                          </span>
                        </p>
                        <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                          <span className="font-medium">Tipo:</span>{" "}
                          <span className="font-semibold">{selectedRoom.type}</span>
                        </p>
                        <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                          <span className="font-medium">Estado:</span>{" "}
                          <span className={`font-semibold ${
                            roomsStatus[selectedRoom.id] 
                              ? "text-yellow-500" 
                              : "text-green-500"
                          }`}>
                            {roomsStatus[selectedRoom.id] ? "Ocupado" : "Disponible"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditMode(!editMode)}
                        className={`p-2 rounded-full ${editMode ? 'bg-yellow-100 text-yellow-800' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        title={editMode ? "Cancelar edición" : "Editar información"}
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        onClick={() => setSelectedRoom(null)}
                        className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        title="Cerrar"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                      {studentsForm.map((student, idx) => (
                        <div key={student.id} className={`border ${darkMode ? 'border-gray-700' : 'border-blue-200'} rounded-lg p-3 md:p-4 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                          <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-2 md:mb-3 flex items-center`}>
                            <span className={`inline-block w-2 h-2 md:w-3 md:h-3 ${darkMode ? 'bg-yellow-500' : 'bg-yellow-500'} rounded-full mr-1 md:mr-2`}></span>
                            Estudiante {idx + 1}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div>
                              <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>Nombre</label>
                              <input
                                value={student.name}
                                onChange={(e) => handleInputChange(idx, "name", e.target.value)}
                                className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                                required={idx === 0 && !roomsStatus[selectedRoom.id]}
                                disabled={!editMode}
                              />
                            </div>

                            <div>
                              <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>Semestre</label>
                              <input
                                value={student.semester}
                                onChange={(e) => handleInputChange(idx, "semester", e.target.value)}
                                className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                                required={idx === 0 && !roomsStatus[selectedRoom.id]}
                                disabled={!editMode}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>Foto</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoChange(idx, e.target.files[0])}
                                className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs md:text-sm ${themeClasses.inputBg}`}
                                disabled={!editMode}
                              />
                              {student.photo && (
                                <div className="mt-2 flex items-center gap-2">
                                  <img
                                    src={student.photo}
                                    alt="Foto estudiante"
                                    className="w-12 h-12 md:w-16 md:h-16 object-cover rounded border border-blue-200"
                                  />
                                  {editMode && (
                                    <button
                                      type="button"
                                      onClick={() => handleInputChange(idx, "photo", "")}
                                      className="text-red-500 text-sm"
                                    >
                                      Eliminar
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="md:col-span-2">
                              <div className="flex justify-between items-center">
                                <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>Activos</label>
                                {editMode && (
                                  <button
                                    type="button"
                                    onClick={() => addAsset(idx)}
                                    className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700"
                                  >
                                    <FiPlus size={12} /> Agregar activo
                                  </button>
                                )}
                              </div>
                              <div className="space-y-1 md:space-y-2">
                                {student.assets.map((asset, assetIdx) => (
                                  <div key={asset.id} className="grid grid-cols-12 gap-2 md:gap-3 items-center">
                                    <div className="col-span-5">
                                      <input
                                        placeholder="Nombre activo"
                                        value={asset.name}
                                        onChange={(e) => handleAssetChange(idx, assetIdx, "name", e.target.value)}
                                        className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs md:text-sm ${themeClasses.inputBg}`}
                                        disabled={!editMode}
                                      />
                                    </div>
                                    <div className="col-span-5">
                                      <input
                                        placeholder="Código"
                                        value={asset.code}
                                        onChange={(e) => handleAssetChange(idx, assetIdx, "code", e.target.value)}
                                        className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs md:text-sm ${themeClasses.inputBg}`}
                                        disabled={!editMode}
                                      />
                                    </div>
                                    {editMode && (
                                      <div className="col-span-2">
                                        <button
                                          type="button"
                                          onClick={() => removeAsset(idx, assetIdx)}
                                          className="text-red-500 hover:text-red-700 p-1"
                                        >
                                          <FiX size={16} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {editMode && (
                        <div className="flex flex-wrap justify-between items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-blue-200">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => toggleOccupied(selectedRoom.id)}
                              className={`px-3 py-1 md:px-4 md:py-2 rounded font-medium text-sm md:text-base ${
                                roomsStatus[selectedRoom.id]
                                  ? "bg-yellow-400 hover:bg-yellow-500 text-blue-900"
                                  : darkMode 
                                    ? "bg-blue-700 hover:bg-blue-600 text-white" 
                                    : "bg-blue-200 hover:bg-blue-300 text-blue-800"
                              } transition-colors`}
                            >
                              {roomsStatus[selectedRoom.id] ? "Marcar Disponible" : "Marcar Ocupado"}
                            </button>
                            <button
                              type="button"
                              onClick={() => clearRoomData(selectedRoom.id)}
                              className={`px-3 py-1 md:px-4 md:py-2 rounded font-medium text-sm md:text-base ${
                                darkMode 
                                  ? "bg-red-700 hover:bg-red-600 text-white" 
                                  : "bg-red-200 hover:bg-red-300 text-red-800"
                              } transition-colors flex items-center gap-1`}
                            >
                              <FiTrash2 /> Vaciar
                            </button>
                          </div>

                          <div className="flex gap-2 md:gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRoom(null);
                                setEditMode(false);
                              }}
                              className={`px-3 py-1 md:px-4 md:py-2 ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded font-medium text-sm md:text-base transition-colors`}
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className={`px-3 py-1 md:px-4 md:py-2 flex items-center gap-1 ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-700 hover:bg-blue-800'} text-white rounded font-medium text-sm md:text-base transition-colors`}
                            >
                              <FiSave /> Guardar
                            </button>
                          </div>
                        </div>
                      )}
                    </form>

                    <div className={`border ${darkMode ? 'border-gray-700' : 'border-blue-200'} rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-3 flex items-center`}>
                        <span className={`inline-block w-2 h-2 md:w-3 md:h-3 ${darkMode ? 'bg-yellow-500' : 'bg-yellow-500'} rounded-full mr-1 md:mr-2`}></span>
                        Código QR de la Habitación
                      </h3>
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-4 rounded-lg mb-4">
                          <QRCode 
                            value={generateRoomQR(selectedRoom.id)} 
                            size={180}
                            level="H"
                            className="QRCode"
                          />
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center mb-4`}>
                          Escanea este código para acceder rápidamente a la información de esta habitación
                        </p>
                        <button
                          onClick={handleDownloadQR}
                          className={`px-3 py-1 text-sm rounded flex items-center gap-1 mx-auto ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                        >
                          <FiDownload className="inline" /> Descargar QR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de habitación administrativa */}
        <AnimatePresence>
          {selectedAdminRoom && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className={`${themeClasses.modalBg} rounded-xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto`}
                style={{ borderTop: "4px solid #F59E0B" }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 20, opacity: 0 }}
              >
                <div className="p-4 md:p-6">
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div>
                      <h2 className={`text-xl md:text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-blue-900'}`}>
                        Información del Cuarto
                        {editMode && <span className="text-sm ml-2 text-yellow-600">(Editando)</span>}
                      </h2>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 md:gap-x-4 md:gap-y-2 mt-1 md:mt-2">
                        <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                          <span className="font-medium">Número:</span>{" "}
                          <span className="font-semibold">
                            {selectedAdminRoom.label}-{selectedAdminRoom.number}
                          </span>
                        </p>
                        <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                          <span className="font-medium">Tipo:</span>{" "}
                          <span className="font-semibold">{selectedAdminRoom.type}</span>
                        </p>
                        <p className={`text-sm md:text-base ${darkMode ? 'text-gray-300' : 'text-blue-800'}`}>
                          <span className="font-medium">Estado:</span>{" "}
                          <span className={`font-semibold ${
                            adminRoomsStatus[selectedAdminRoom.id] 
                              ? "text-yellow-500" 
                              : "text-green-500"
                          }`}>
                            {adminRoomsStatus[selectedAdminRoom.id] ? "Ocupado" : "Disponible"}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setEditMode(!editMode)}
                        className={`p-2 rounded-full ${editMode ? 'bg-yellow-100 text-yellow-800' : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'}`}
                        title={editMode ? "Cancelar edición" : "Editar información"}
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        onClick={() => setSelectedAdminRoom(null)}
                        className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                        title="Cerrar"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <form onSubmit={handleAdminSubmit} className="space-y-4 md:space-y-6">
                      {staffForm.map((staff, idx) => (
                        <div key={staff.id} className={`border ${darkMode ? 'border-gray-700' : 'border-blue-200'} rounded-lg p-3 md:p-4 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                          <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-2 md:mb-3 flex items-center`}>
                            <span className={`inline-block w-2 h-2 md:w-3 md:h-3 ${darkMode ? 'bg-yellow-500' : 'bg-yellow-500'} rounded-full mr-1 md:mr-2`}></span>
                            {selectedAdminRoom.label.startsWith('Admin') ? 'Administrativo' : 'Militar'} {idx + 1}
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                            <div>
                              <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>Nombre</label>
                              <input
                                value={staff.name}
                                onChange={(e) => handleStaffInputChange(idx, "name", e.target.value)}
                                className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                                required={idx === 0 && !adminRoomsStatus[selectedAdminRoom.id]}
                                disabled={!editMode}
                              />
                            </div>

                            <div>
                              <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>
                                {selectedAdminRoom.label.startsWith('Admin') ? 'Cargo' : 'Rango'}
                              </label>
                              <input
                                value={staff.position}
                                onChange={(e) => handleStaffInputChange(idx, "position", e.target.value)}
                                className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                                required={idx === 0 && !adminRoomsStatus[selectedAdminRoom.id]}
                                disabled={!editMode}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>Departamento</label>
                              <input
                                value={staff.department}
                                onChange={(e) => handleStaffInputChange(idx, "department", e.target.value)}
                                className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                                required={idx === 0 && !adminRoomsStatus[selectedAdminRoom.id]}
                                disabled={!editMode}
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>Foto</label>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleStaffPhotoChange(idx, e.target.files[0])}
                                className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs md:text-sm ${themeClasses.inputBg}`}
                                disabled={!editMode}
                              />
                              {staff.photo && (
                                <div className="mt-2 flex items-center gap-2">
                                  <img
                                    src={staff.photo}
                                    alt="Foto del personal"
                                    className="w-12 h-12 md:w-16 md:h-16 object-cover rounded border border-blue-200"
                                  />
                                  {editMode && (
                                    <button
                                      type="button"
                                      onClick={() => handleStaffInputChange(idx, "photo", "")}
                                      className="text-red-500 text-sm"
                                    >
                                      Eliminar
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="md:col-span-2">
                              <div className="flex justify-between items-center">
                                <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : 'text-blue-700'} mb-1`}>Activos</label>
                                {editMode && (
                                  <button
                                    type="button"
                                    onClick={() => addStaffAsset(idx)}
                                    className="text-xs flex items-center gap-1 text-blue-500 hover:text-blue-700"
                                  >
                                    <FiPlus size={12} /> Agregar activo
                                  </button>
                                )}
                              </div>
                              <div className="space-y-1 md:space-y-2">
                                {staff.assets.map((asset, assetIdx) => (
                                  <div key={asset.id} className="grid grid-cols-12 gap-2 md:gap-3 items-center">
                                    <div className="col-span-5">
                                      <input
                                        placeholder="Nombre activo"
                                        value={asset.name}
                                        onChange={(e) => handleStaffAssetChange(idx, assetIdx, "name", e.target.value)}
                                        className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs md:text-sm ${themeClasses.inputBg}`}
                                        disabled={!editMode}
                                      />
                                    </div>
                                    <div className="col-span-5">
                                      <input
                                        placeholder="Código"
                                        value={asset.code}
                                        onChange={(e) => handleStaffAssetChange(idx, assetIdx, "code", e.target.value)}
                                        className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs md:text-sm ${themeClasses.inputBg}`}
                                        disabled={!editMode}
                                      />
                                    </div>
                                    {editMode && (
                                      <div className="col-span-2">
                                        <button
                                          type="button"
                                          onClick={() => removeStaffAsset(idx, assetIdx)}
                                          className="text-red-500 hover:text-red-700 p-1"
                                        >
                                          <FiX size={16} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {editMode && (
                        <div className="flex flex-wrap justify-between items-center gap-2 md:gap-3 pt-3 md:pt-4 border-t border-blue-200">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => toggleAdminOccupied(selectedAdminRoom.id)}
                              className={`px-3 py-1 md:px-4 md:py-2 rounded font-medium text-sm md:text-base ${
                                adminRoomsStatus[selectedAdminRoom.id]
                                  ? "bg-yellow-400 hover:bg-yellow-500 text-blue-900"
                                  : darkMode 
                                    ? "bg-blue-700 hover:bg-blue-600 text-white" 
                                    : "bg-blue-200 hover:bg-blue-300 text-blue-800"
                              } transition-colors`}
                            >
                              {adminRoomsStatus[selectedAdminRoom.id] ? "Marcar Disponible" : "Marcar Ocupado"}
                            </button>
                            <button
                              type="button"
                              onClick={() => clearAdminRoomData(selectedAdminRoom.id)}
                              className={`px-3 py-1 md:px-4 md:py-2 rounded font-medium text-sm md:text-base ${
                                darkMode 
                                  ? "bg-red-700 hover:bg-red-600 text-white" 
                                  : "bg-red-200 hover:bg-red-300 text-red-800"
                              } transition-colors flex items-center gap-1`}
                            >
                              <FiTrash2 /> Vaciar
                            </button>
                          </div>

                          <div className="flex gap-2 md:gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAdminRoom(null);
                                setEditMode(false);
                              }}
                              className={`px-3 py-1 md:px-4 md:py-2 ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'} rounded font-medium text-sm md:text-base transition-colors`}
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className={`px-3 py-1 md:px-4 md:py-2 flex items-center gap-1 ${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-700 hover:bg-blue-800'} text-white rounded font-medium text-sm md:text-base transition-colors`}
                            >
                              <FiSave /> Guardar
                            </button>
                          </div>
                        </div>
                      )}
                    </form>

                    <div className={`border ${darkMode ? 'border-gray-700' : 'border-blue-200'} rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-blue-300' : 'text-blue-800'} mb-3 flex items-center`}>
                        <span className={`inline-block w-2 h-2 md:w-3 md:h-3 ${darkMode ? 'bg-yellow-500' : 'bg-yellow-500'} rounded-full mr-1 md:mr-2`}></span>
                        Código QR de la Habitación
                      </h3>
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-4 rounded-lg mb-4">
                          <QRCode 
                            value={generateAdminRoomQR(selectedAdminRoom.id)} 
                            size={180}
                            level="H"
                            className="AdminQRCode"
                          />
                        </div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center mb-4`}>
                          Escanea este código para acceder rápidamente a la información de esta habitación
                        </p>
                        <button
                          onClick={handleDownloadAdminQR}
                          className={`px-3 py-1 text-sm rounded flex items-center gap-1 mx-auto ${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                        >
                          <FiDownload className="inline" /> Descargar QR
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RoomMap;