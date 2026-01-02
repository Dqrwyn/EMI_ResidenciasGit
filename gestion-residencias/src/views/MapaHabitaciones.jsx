// src/views/MapaHabitaciones.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { toast, Toaster } from "react-hot-toast";

// Importar componentes divididos
import PaymentHistory from "../components/habitaciones/PaymentHistory";
import PaymentDashboard from "../components/habitaciones/PaymentDashboard";
import SearchSystem from "../components/habitaciones/SearchSystem";
import RoomCard from "../components/habitaciones/RoomCard";
import RoomModal from "../components/layout/RoomModal";

// Importar constantes y utilidades
import {
  COLOR_PALETTE,
  ROOM_TYPES,
  ADMIN_ROOM_TYPES,
  ASSET_STATUS,
  PAYMENT_STATUS,
  MONTHS,
  PAYMENT_MONTHS,
  ACADEMIC_YEARS,
  FLOORS,
  ADMIN_FLOORS,
  SIDES,
  ROOMS_PER_SIDE,
  ADMIN_SIDES,
  ADMIN_ROOMS_PER_SIDE,
  ROOM_PRICES,
  CAREERS,
  INITIAL_ROOM_DATA,
  INITIAL_ADMIN_ROOM_DATA,
  fadeIn,
  slideUp,
  calculateStudentDebt,
  countPendingMonths,
  getGlobalRoomNumber
} from "../components/utils/constants";

// Importar imágenes
import loaderImage from '../assets/images.png';
import img1 from '../assets/1.jpg';
import img2 from '../assets/2.jpg';
import img3 from '../assets/3.jpg';
import img4 from '../assets/4.jpg';

const MapaHabitaciones = ({ modoOscuro, alternarModoOscuro }) => {
  // Estados
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [roomsStatus, setRoomsStatus] = useState({});
  const [adminRoomsStatus, setAdminRoomsStatus] = useState({});
  const [darkMode, setDarkMode] = useState(modoOscuro);
  const [roomsData, setRoomsData] = useState({});
  const [adminRoomsData, setAdminRoomsData] = useState({});
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedAdminRoom, setSelectedAdminRoom] = useState(null);
  const [studentsForm, setStudentsForm] = useState([]);
  const [staffForm, setStaffForm] = useState([]);
  const [activeSection, setActiveSection] = useState('estudiantes-section');
  const [showPaymentDashboard, setShowPaymentDashboard] = useState(false);
  const [showSearchSystem, setShowSearchSystem] = useState(false);
  const images = [img1, img2, img3, img4];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Referencias para las secciones
  const estudiantesSectionRef = useRef(null);
  const personalSectionRef = useRef(null);

  // Sincronizar darkMode con prop
  useEffect(() => {
    setDarkMode(modoOscuro);
  }, [modoOscuro]);

  // Cargar datos iniciales desde MongoDB
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setShowLoader(true);
        
        const response = await fetch('/api/rooms');
        const data = await response.json();
        
        if (response.ok) {
          setRoomsData(data.rooms || INITIAL_ROOM_DATA);
          setAdminRoomsData(data.adminRooms || INITIAL_ADMIN_ROOM_DATA);
        } else {
          console.error('Error cargando datos:', data.message);
          setRoomsData(INITIAL_ROOM_DATA);
          setAdminRoomsData(INITIAL_ADMIN_ROOM_DATA);
        }
        
        const statusResponse = await fetch('/api/rooms-status');
        const statusData = await statusResponse.json();
        
        if (statusResponse.ok) {
          setRoomsStatus(statusData.roomsStatus || {});
          setAdminRoomsStatus(statusData.adminRoomsStatus || {});
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        setRoomsData(INITIAL_ROOM_DATA);
        setAdminRoomsData(INITIAL_ADMIN_ROOM_DATA);
      } finally {
        setTimeout(() => {
          setShowLoader(false);
          setTimeout(() => setIsLoading(false), 500);
        }, 1000);
      }
    };
    
    loadInitialData();
  }, []);

  // Efecto para el carrusel automático de imágenes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [images.length]);

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
      if (estudiantesSectionRef.current && personalSectionRef.current) {
        const estudiantesPosition = estudiantesSectionRef.current.getBoundingClientRect();
        const personalPosition = personalSectionRef.current.getBoundingClientRect();
        
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

  // Función para desplazarse a secciones
  const scrollToSection = (sectionRef) => {
    if (sectionRef && sectionRef.current) {
      const element = sectionRef.current;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 80;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      if (sectionRef === estudiantesSectionRef) {
        setActiveSection('estudiantes-section');
      } else if (sectionRef === personalSectionRef) {
        setActiveSection('personal-section');
      }
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
            ci: "",
            cellphone: "",
            career: "",
            semester: "",
            code: "",
            roomNumber: selectedRoom.label + "-" + selectedRoom.number,
            roomType: selectedRoom.type,
            tutorName: "",
            tutorCellphone: "",
            admissionDate: new Date().toISOString().split('T')[0],
            observation: "",
            photo: "",
            paymentHistory: {},
            assets: [
              { id: `temp-asset-${Date.now()}-${i}-0`, name: "", code: "", status: ASSET_STATUS.OPTIMO, description: "" },
              { id: `temp-asset-${Date.now()}-${i}-1`, name: "", code: "", status: ASSET_STATUS.OPTIMO, description: "" },
              { id: `temp-asset-${Date.now()}-${i}-2`, name: "", code: "", status: ASSET_STATUS.OPTIMO, description: "" },
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
              { id: `temp-asset-${Date.now()}-${i}-0`, name: "", code: "", status: ASSET_STATUS.OPTIMO, description: "" },
              { id: `temp-asset-${Date.now()}-${i}-1`, name: "", code: "", status: ASSET_STATUS.OPTIMO, description: "" }
            ]
          }
        );
      }
      setStaffForm(newStaff);
    }
  }, [selectedAdminRoom, adminRoomsData]);

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
  const clearRoomData = async (roomId) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setRoomsData(prev => {
          const newData = {...prev};
          delete newData[roomId];
          return newData;
        });
        setRoomsStatus(prev => ({ ...prev, [roomId]: false }));
        toast.success("Información de la habitación vaciada");
      } else {
        const errorData = await response.json();
        toast.error(`Error vaciando habitación: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error vaciando habitación:', error);
      toast.error("Error de conexión al vaciar habitación");
    }
    
    if (selectedRoom && selectedRoom.id === roomId) {
      const maxStudents = selectedRoom.type === ROOM_TYPES.SHARED ? 3 : 2;
      const emptyStudents = Array(maxStudents).fill().map((_, i) => ({
        id: `temp-${Date.now()}-${i}`,
        name: "",
        ci: "",
        cellphone: "",
        career: "",
        semester: "",
        code: "",
        roomNumber: selectedRoom.label + "-" + selectedRoom.number,
        roomType: selectedRoom.type,
        tutorName: "",
        tutorCellphone: "",
        admissionDate: new Date().toISOString().split('T')[0],
        observation: "",
        photo: "",
        paymentHistory: {},
        assets: [
          { id: `temp-asset-${Date.now()}-${i}-0`, name: "", code: "", status: ASSET_STATUS.OPTIMO, description: "" },
          { id: `temp-asset-${Date.now()}-${i}-1`, name: "", code: "", status: ASSET_STATUS.OPTIMO, description: "" },
          { id: `temp-asset-${Date.now()}-${i}-2`, name: "", code: "", status: ASSET_STATUS.OPTIMO, description: "" },
        ],
      }));
      setStudentsForm(emptyStudents);
    }
  };

  const clearAdminRoomData = async (roomId) => {
    try {
      const response = await fetch(`/api/admin-rooms/${roomId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setAdminRoomsData(prev => {
          const newData = {...prev};
          delete newData[roomId];
          return newData;
        });
        setAdminRoomsStatus(prev => ({ ...prev, [roomId]: false }));
        toast.success("Información de la habitación vaciada");
      } else {
        const errorData = await response.json();
        toast.error(`Error vaciando habitación: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error vaciando habitación administrativa:', error);
      toast.error("Error de conexión al vaciar habitación");
    }
    
    if (selectedAdminRoom && selectedAdminRoom.id === roomId) {
      const maxStaff = selectedAdminRoom.type === ADMIN_ROOM_TYPES.SHARED ? 2 : 1;
      const emptyStaff = Array(maxStaff).fill().map((_, i) => ({
        id: `temp-staff-${Date.now()}-${i}`,
        name: "",
        position: "",
        department: "",
        photo: "",
        assets: [
          { id: `temp-asset-${Date.now()}-${i}-0`, name: "", code: "", status: ASSET_STATUS.OPTIMO, description: "" },
          { id: `temp-asset-${Date.now()}-${i}-1`, name: "", code: "", status: ASSET_STATUS.OPTIMO, description: "" }
        ]
      }));
      setStaffForm(emptyStaff);
    }
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

  // Manejar cambios en los pagos
  const handlePaymentUpdate = (studentIndex, year, month, data) => {
    setStudentsForm(prev => {
      const updated = [...prev];
      const currentPaymentHistory = updated[studentIndex].paymentHistory || {};
      const updatedYear = { ...(currentPaymentHistory[year] || {}) };
      
      updatedYear[month] = data;
      
      updated[studentIndex].paymentHistory = {
        ...currentPaymentHistory,
        [year]: updatedYear
      };
      
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
        updatedAssets[assetIndex] = { 
          id: `temp-asset-${Date.now()}`, 
          name: "", 
          code: "", 
          status: ASSET_STATUS.OPTIMO, 
          description: "" 
        };
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
        updatedAssets[assetIndex] = { 
          id: `temp-asset-${Date.now()}`, 
          name: "", 
          code: "", 
          status: ASSET_STATUS.OPTIMO, 
          description: "" 
        };
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
        { id: `new-asset-${Date.now()}`, name: "", code: "", status: ASSET_STATUS.OPTIMO, description: "" }
      ];
      return updated;
    });
  };

  const addStaffAsset = (staffIndex) => {
    setStaffForm(prev => {
      const updated = [...prev];
      updated[staffIndex].assets = [
        ...updated[staffIndex].assets,
        { id: `new-asset-${Date.now()}`, name: "", code: "", status: ASSET_STATUS.OPTIMO, description: "" }
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

    try {
      const response = await fetch(`/api/rooms/${selectedRoom.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          students: studentsWithValidAssets,
        }),
      });

      if (response.ok) {
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
      } else {
        const errorData = await response.json();
        toast.error(`Error guardando: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error guardando habitación:', error);
      toast.error("Error de conexión al guardar");
    } finally {
      setShowLoader(false);
      setTimeout(() => {
        setIsLoading(false);
        setSelectedRoom(null);
      }, 500);
    }
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

    try {
      const response = await fetch(`/api/admin-rooms/${selectedAdminRoom.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          staff: staffWithValidAssets,
        }),
      });

      if (response.ok) {
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
      } else {
        const errorData = await response.json();
        toast.error(`Error guardando: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error guardando habitación administrativa:', error);
      toast.error("Error de conexión al guardar");
    } finally {
      setShowLoader(false);
      setTimeout(() => {
        setIsLoading(false);
        setSelectedAdminRoom(null);
      }, 500);
    }
  };

  // Función para verificar si una habitación tiene problemas de pago
  const hasPaymentIssues = (roomId) => {
    const room = roomsData[roomId];
    if (!room || !room.students) return false;
    
    return room.students.some(student => {
      const roomType = roomId.includes('Individual') || parseInt(roomId.split('-').pop()) <= 4 ? 'INDIVIDUAL' : 'SHARED';
      return calculateStudentDebt(student, roomType) > 0;
    });
  };

  // Función para obtener el color según el estado del activo
  const getStatusColor = (status) => {
    switch (status) {
      case ASSET_STATUS.OPTIMO:
        return darkMode ? "bg-green-700" : "bg-green-100 text-green-800";
      case ASSET_STATUS.DETERIORADO:
        return darkMode ? "bg-yellow-700" : "bg-yellow-100 text-yellow-800";
      case ASSET_STATUS.EN_REPARACION:
        return darkMode ? "bg-blue-700" : "bg-blue-100 text-blue-800";
      case ASSET_STATUS.NO_UBICADO:
        return darkMode ? "bg-red-700" : "bg-red-100 text-red-800";
      case ASSET_STATUS.OTRO:
        return darkMode ? "bg-gray-700" : "bg-gray-100 text-gray-800";
      default:
        return darkMode ? "bg-gray-700" : "bg-gray-100 text-gray-800";
    }
  };

  // Clases condicionales para modo oscuro
  const themeClasses = {
    bg: darkMode ? "bg-gray-900" : COLOR_PALETTE.primary.light,
    text: darkMode ? "text-gray-100" : COLOR_PALETTE.primary.dark,
    cardBg: darkMode ? "bg-gray-800" : "bg-white",
    cardBorder: darkMode ? "border-gray-700" : `border-[${COLOR_PALETTE.primary.main}]`,
    modalBg: darkMode ? "bg-gray-800" : "bg-white",
    inputBg: darkMode ? "bg-gray-700 text-white" : "bg-white",
    inputBorder: darkMode ? "border-gray-600" : `border-[${COLOR_PALETTE.primary.main}]`,
    statsBg: darkMode ? "bg-gray-700" : COLOR_PALETTE.primary.light,
    statsText: darkMode ? "text-gray-100" : COLOR_PALETTE.primary.dark,
    womenColor: darkMode ? "pink-400" : "pink-600",
    menColor: darkMode ? "blue-400" : "blue-600",
    adminColor: darkMode ? "green-400" : "green-600",
    militaryColor: darkMode ? "purple-400" : "purple-600"
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} p-4 md:p-6 relative transition-colors duration-300 overflow-hidden`}>
      <Toaster position="top-right" toastOptions={{
        className: darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800',
      }} />

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
                className={`mt-4 font-semibold ${darkMode ? 'text-yellow-400' : `text-[${COLOR_PALETTE.primary.dark}]`}`}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Cargando residencias...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard de Pagos */}
      <PaymentDashboard 
        roomsData={roomsData} 
        isOpen={showPaymentDashboard} 
        onClose={() => setShowPaymentDashboard(false)}
        darkMode={darkMode}
      />

      {/* Sistema de Búsqueda */}
      <SearchSystem 
        roomsData={roomsData} 
        isOpen={showSearchSystem} 
        onClose={() => setShowSearchSystem(false)}
        darkMode={darkMode}
        onRoomSelect={setSelectedRoom}
      />

      {/* Contenido principal */}
      <div 
        className="relative z-10" 
        style={{ 
          backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.85)' : `rgba(223, 234, 248, 0.85)`,
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
            RESIDENCIA UNIVERSITARIA ESTUDIANTIL
          </motion.h2>
          <motion.div 
            className={`h-1 w-20 md:w-24 ${darkMode ? `bg-[${COLOR_PALETTE.secondary.main}]` : `bg-[${COLOR_PALETTE.secondary.main}]`} mx-auto`}
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
          ref={estudiantesSectionRef}
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
            { title: "Bloque Damas", type: "Damas", color: themeClasses.womenColor }, 
            { title: "Bloque Varones", type: "Varones", color: themeClasses.menColor }
          ].map((building) => (
            <motion.div
              key={building.title}
              className={`${themeClasses.cardBg} p-4 md:p-6 rounded-xl shadow-md ${themeClasses.cardBorder}`}
              variants={slideUp}
            >
              <div className="flex items-center mb-4 md:mb-6">
                <div className={`h-6 md:h-8 w-1 ${darkMode ? `bg-[${COLOR_PALETTE.secondary.main}]` : `bg-[${COLOR_PALETTE.secondary.main}]`} mr-2 md:mr-3 rounded-full`}></div>
                <h3 className={`text-lg md:text-xl font-semibold ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`}`}>
                  {building.title}
                </h3>
              </div>

              {FLOORS.map((floor) => (
                <div key={floor.id} className="mb-4 md:mb-6">
                  <h4 className={`${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} font-medium mb-2 md:mb-3 flex items-center`}>
                    <span className={`inline-block w-2 h-4 md:h-6 ${darkMode ? 'bg-blue-400' : `bg-[${COLOR_PALETTE.primary.main}]`} mr-2 rounded-full`}></span>
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
                              const hasPaymentIssue = hasPaymentIssues(roomId);
                              
                              return (
                                <RoomCard
                                  key={roomId}
                                  roomId={roomId}
                                  building={building}
                                  floor={floor}
                                  side={side}
                                  roomNumber={roomNumber}
                                  roomType={roomType}
                                  isOccupied={isOccupied}
                                  occupantsCount={occupantsCount}
                                  hasPaymentIssue={hasPaymentIssue}
                                  onSelect={setSelectedRoom}
                                  darkMode={darkMode}
                                />
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
            RESIDENCIA DEL PERSONAL ADMINISTRATIVO Y MILITAR
          </motion.h2>
          <motion.div 
            className={`h-1 w-20 md:w-24 ${darkMode ? `bg-[${COLOR_PALETTE.secondary.main}]` : `bg-[${COLOR_PALETTE.secondary.main}]`} mx-auto`}
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
          ref={personalSectionRef}
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
            { title: "Bloque Administrativo", type: "Admin", color: themeClasses.adminColor }, 
            { title: "Bloque Militar", type: "Military", color: themeClasses.militaryColor }
          ].map((building) => (
            <motion.div
              key={building.title}
              className={`${themeClasses.cardBg} p-4 md:p-6 rounded-xl shadow-md ${themeClasses.cardBorder}`}
              variants={slideUp}
            >
              <div className="flex items-center mb-4 md:mb-6">
                <div className={`h-6 md:h-8 w-1 ${darkMode ? `bg-[${COLOR_PALETTE.secondary.main}]` : `bg-[${COLOR_PALETTE.secondary.main}]`} mr-2 md:mr-3 rounded-full`}></div>
                <h3 className={`text-lg md:text-xl font-semibold ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`}`}>
                  {building.title}
                </h3>
              </div>

              {ADMIN_FLOORS.map((floor) => (
                <div key={floor.id} className="mb-4 md:mb-6">
                  <h4 className={`${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} font-medium mb-2 md:mb-3 flex items-center`}>
                    <span className={`inline-block w-2 h-4 md:h-6 ${darkMode ? 'bg-blue-400' : `bg-[${COLOR_PALETTE.primary.main}]`} mr-2 rounded-full`}></span>
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
                              
                              return (
                                <RoomCard
                                  key={roomId}
                                  roomId={roomId}
                                  building={building}
                                  floor={floor}
                                  side={side}
                                  roomNumber={roomNumber}
                                  roomType={roomType}
                                  isOccupied={isOccupied}
                                  occupantsCount={staffCount}
                                  hasPaymentIssue={false}
                                  onSelect={setSelectedAdminRoom}
                                  darkMode={darkMode}
                                />
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
        <RoomModal
          isOpen={!!selectedRoom}
          onClose={() => setSelectedRoom(null)}
          title="Información del Cuarto"
          editMode={false}
          onToggleEdit={() => {}}
          darkMode={darkMode}
          roomInfo={selectedRoom ? {
            ...selectedRoom,
            isOccupied: roomsStatus[selectedRoom.id],
            price: selectedRoom.type === ROOM_TYPES.INDIVIDUAL ? ROOM_PRICES.INDIVIDUAL : ROOM_PRICES.SHARED
          } : null}
          onToggleOccupied={() => toggleOccupied(selectedRoom?.id)}
          onClearRoom={() => clearRoomData(selectedRoom?.id)}
          onSubmit={handleSubmit}
          showSubmitButton={false}
        >
          {selectedRoom && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                {studentsForm.map((student, idx) => (
                  <div key={student.id} className={`border ${darkMode ? 'border-gray-700' : `border-[${COLOR_PALETTE.primary.main}]`} rounded-lg p-3 md:p-4 ${darkMode ? 'bg-gray-700' : COLOR_PALETTE.primary.light}`}>
                    <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-2 md:mb-3 flex items-center`}>
                      <span className={`inline-block w-2 h-2 md:w-3 md:h-3 ${darkMode ? `bg-[${COLOR_PALETTE.secondary.main}]` : `bg-[${COLOR_PALETTE.secondary.main}]`} rounded-full mr-1 md:mr-2`}></span>
                      Estudiante {idx + 1}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Nombre Completo</label>
                        <input
                          value={student.name}
                          onChange={(e) => handleInputChange(idx, "name", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          required={idx === 0 && !roomsStatus[selectedRoom.id]}
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Cédula de Identidad</label>
                        <input
                          value={student.ci}
                          onChange={(e) => handleInputChange(idx, "ci", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          required={idx === 0 && !roomsStatus[selectedRoom.id]}
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Celular</label>
                        <input
                          value={student.cellphone}
                          onChange={(e) => handleInputChange(idx, "cellphone", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Carrera</label>
                        <select
                          value={student.career}
                          onChange={(e) => handleInputChange(idx, "career", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          disabled={true}
                        >
                          <option value="">Seleccione una carrera</option>
                          {CAREERS.map(career => (
                            <option key={career} value={career}>{career}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Semestre</label>
                        <select
                          value={student.semester}
                          onChange={(e) => handleInputChange(idx, "semester", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          required={idx === 0 && !roomsStatus[selectedRoom.id]}
                          disabled={true}
                        >
                          <option value="">Seleccione semestre</option>
                          <option value="Primer">Primer Semestre</option>
                          <option value="Segundo">Segundo Semestre</option>
                          <option value="Tercer">Tercer Semestre</option>
                          <option value="Cuarto">Cuarto Semestre</option>
                          <option value="Quinto">Quinto Semestre</option>
                          <option value="Sexto">Sexto Semestre</option>
                          <option value="Séptimo">Séptimo Semestre</option>
                          <option value="Octavo">Octavo Semestre</option>
                          <option value="Noveno">Noveno Semestre</option>
                          <option value="Décimo">Décimo Semestre</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Código</label>
                        <input
                          value={student.code}
                          onChange={(e) => handleInputChange(idx, "code", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>N° Habitación</label>
                        <input
                          value={student.roomNumber}
                          onChange={(e) => handleInputChange(idx, "roomNumber", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Tipo de Habitación</label>
                        <select
                          value={student.roomType}
                          onChange={(e) => handleInputChange(idx, "roomType", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          disabled={true}
                        >
                          <option value={ROOM_TYPES.INDIVIDUAL}>Individual</option>
                          <option value={ROOM_TYPES.SHARED}>Compartido</option>
                        </select>
                      </div>

                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Nombre del Tutor</label>
                        <input
                          value={student.tutorName}
                          onChange={(e) => handleInputChange(idx, "tutorName", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Celular del Tutor</label>
                        <input
                          value={student.tutorCellphone}
                          onChange={(e) => handleInputChange(idx, "tutorCellphone", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Fecha de Ingreso</label>
                        <input
                          type="date"
                          value={student.admissionDate}
                          onChange={(e) => handleInputChange(idx, "admissionDate", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          disabled={true}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Observación</label>
                        <textarea
                          value={student.observation}
                          onChange={(e) => handleInputChange(idx, "observation", e.target.value)}
                          rows={2}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          disabled={true}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Foto</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoChange(idx, e.target.files[0])}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs md:text-sm ${themeClasses.inputBg}`}
                          disabled={true}
                        />
                        {student.photo && (
                          <div className="mt-2 flex items-center gap-2">
                            <img
                              src={student.photo}
                              alt="Foto estudiante"
                              className="w-12 h-12 md:w-16 md:h-16 object-cover rounded border border-blue-200"
                            />
                          </div>
                        )}
                      </div>

                      {/* Sistema de Pagos */}
                      <div className="md:col-span-2">
                        <PaymentHistory 
                          paymentHistory={student.paymentHistory || {}} 
                          onPaymentUpdate={(year, month, data) => handlePaymentUpdate(idx, year, month, data)}
                          editable={false}
                          roomType={selectedRoom.type === ROOM_TYPES.INDIVIDUAL ? 'INDIVIDUAL' : 'SHARED'}
                          darkMode={darkMode}
                          studentId={student.id}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex justify-between items-center">
                          <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Activos</label>
                        </div>
                        <div className="space-y-2 md:space-y-3">
                          {student.assets.map((asset, assetIdx) => (
                            <div key={asset.id} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
                              <div className="grid grid-cols-12 gap-2 md:gap-3 items-center mb-2">
                                <div className="col-span-5">
                                  <input
                                    placeholder="Nombre activo"
                                    value={asset.name}
                                    onChange={(e) => handleAssetChange(idx, assetIdx, "name", e.target.value)}
                                    className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs md:text-sm ${themeClasses.inputBg}`}
                                    disabled={true}
                                  />
                                </div>
                                <div className="col-span-5">
                                  <input
                                    placeholder="Código"
                                    value={asset.code}
                                    onChange={(e) => handleAssetChange(idx, assetIdx, "code", e.target.value)}
                                    className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs md:text-sm ${themeClasses.inputBg}`}
                                    disabled={true}
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                <div>
                                  <label className={`block text-xs font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Estado</label>
                                  <select
                                    value={asset.status}
                                    onChange={(e) => handleAssetChange(idx, assetIdx, "status", e.target.value)}
                                    className={`w-full px-2 py-1 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs ${themeClasses.inputBg}`}
                                    disabled={true}
                                  >
                                    {Object.values(ASSET_STATUS).map(status => (
                                      <option key={status} value={status}>{status}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className={`block text-xs font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>
                                    {asset.status === ASSET_STATUS.OTRO ? 'Descripción' : 'Observaciones'}
                                  </label>
                                  <input
                                    placeholder={asset.status === ASSET_STATUS.OTRO ? 'Describe el estado' : 'Observaciones adicionales'}
                                    value={asset.description}
                                    onChange={(e) => handleAssetChange(idx, assetIdx, "description", e.target.value)}
                                    className={`w-full px-2 py-1 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs ${themeClasses.inputBg}`}
                                    disabled={true}
                                  />
                                </div>
                              </div>
                              
                              {asset.status && (
                                <div className={`mt-2 px-2 py-1 rounded text-xs font-medium text-center ${getStatusColor(asset.status)}`}>
                                  {asset.status}
                                  {asset.description && asset.status !== ASSET_STATUS.OPTIMO && (
                                    <span className="ml-1">: {asset.description}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </form>

              <div className={`border ${darkMode ? 'border-gray-700' : `border-[${COLOR_PALETTE.primary.main}]`} rounded-lg p-4 ${darkMode ? 'bg-gray-700' : COLOR_PALETTE.primary.light}`}>
                <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-3 flex items-center`}>
                  <span className={`inline-block w-2 h-2 md:w-3 md:h-3 ${darkMode ? `bg-[${COLOR_PALETTE.secondary.main}]` : `bg-[${COLOR_PALETTE.secondary.main}]`} rounded-full mr-1 md:mr-2`}></span>
                  Información de la Habitación
                </h3>
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg mb-4 flex items-center justify-center h-48 w-48">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${roomsStatus[selectedRoom.id] ? 'text-red-500' : 'text-green-500'}`}>
                        {selectedRoom.number}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedRoom.label}
                      </p>
                      <p className={`text-xs font-medium mt-1 ${roomsStatus[selectedRoom.id] ? 'text-red-500' : 'text-green-500'}`}>
                        {roomsStatus[selectedRoom.id] ? 'OCUPADA' : 'DISPONIBLE'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedRoom.type} - Bs. {selectedRoom.type === ROOM_TYPES.INDIVIDUAL ? ROOM_PRICES.INDIVIDUAL : ROOM_PRICES.SHARED}
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full mt-4">
                    <h4 className={`font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-2`}>
                      Resumen de Pagos
                    </h4>
                    <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
                      {studentsForm.filter(student => student.name.trim() !== "").map((student, idx) => {
                        const debt = calculateStudentDebt(student, selectedRoom.type === ROOM_TYPES.INDIVIDUAL ? 'INDIVIDUAL' : 'SHARED');
                        return (
                          <div key={student.id} className="mb-2 last:mb-0">
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                              {student.name}: <span className={debt > 0 ? "text-red-500 font-medium" : "text-green-500 font-medium"}>
                                Bs. {debt} {debt > 0 ? "(Deuda)" : "(Al día)"}
                              </span>
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </RoomModal>

        {/* Modal de habitación administrativa */}
        <RoomModal
          isOpen={!!selectedAdminRoom}
          onClose={() => setSelectedAdminRoom(null)}
          title="Información del Cuarto"
          editMode={false}
          onToggleEdit={() => {}}
          darkMode={darkMode}
          roomInfo={selectedAdminRoom ? {
            ...selectedAdminRoom,
            isOccupied: adminRoomsStatus[selectedAdminRoom.id]
          } : null}
          onToggleOccupied={() => toggleAdminOccupied(selectedAdminRoom?.id)}
          onClearRoom={() => clearAdminRoomData(selectedAdminRoom?.id)}
          onSubmit={handleAdminSubmit}
          showSubmitButton={false}
        >
          {selectedAdminRoom && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form onSubmit={handleAdminSubmit} className="space-y-4 md:space-y-6">
                {staffForm.map((staff, idx) => (
                  <div key={staff.id} className={`border ${darkMode ? 'border-gray-700' : `border-[${COLOR_PALETTE.primary.main}]`} rounded-lg p-3 md:p-4 ${darkMode ? 'bg-gray-700' : COLOR_PALETTE.primary.light}`}>
                    <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-2 md:mb-3 flex items-center`}>
                      <span className={`inline-block w-2 h-2 md:w-3 md:h-3 ${darkMode ? `bg-[${COLOR_PALETTE.secondary.main}]` : `bg-[${COLOR_PALETTE.secondary.main}]`} rounded-full mr-1 md:mr-2`}></span>
                      {selectedAdminRoom.label.startsWith('Admin') ? 'Administrativo' : 'Militar'} {idx + 1}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Nombre</label>
                        <input
                          value={staff.name}
                          onChange={(e) => handleStaffInputChange(idx, "name", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          required={idx === 0 && !adminRoomsStatus[selectedAdminRoom.id]}
                          disabled={true}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>
                          {selectedAdminRoom.label.startsWith('Admin') ? 'Cargo' : 'Rango'}
                        </label>
                        <input
                          value={staff.position}
                          onChange={(e) => handleStaffInputChange(idx, "position", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          required={idx === 0 && !adminRoomsStatus[selectedAdminRoom.id]}
                          disabled={true}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Departamento</label>
                        <input
                          value={staff.department}
                          onChange={(e) => handleStaffInputChange(idx, "department", e.target.value)}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-sm md:text-base ${themeClasses.inputBg}`}
                          required={idx === 0 && !adminRoomsStatus[selectedAdminRoom.id]}
                          disabled={true}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Foto</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleStaffPhotoChange(idx, e.target.files[0])}
                          className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs md:text-sm ${themeClasses.inputBg}`}
                          disabled={true}
                        />
                        {staff.photo && (
                          <div className="mt-2 flex items-center gap-2">
                            <img
                              src={staff.photo}
                              alt="Foto del personal"
                              className="w-12 h-12 md:w-16 md:h-16 object-cover rounded border border-blue-200"
                            />
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex justify-between items-center">
                          <label className={`block text-xs md:text-sm font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Activos</label>
                        </div>
                        <div className="space-y-2 md:space-y-3">
                          {staff.assets.map((asset, assetIdx) => (
                            <div key={asset.id} className={`p-2 rounded-lg ${darkMode ? 'bg-gray-600' : 'bg-blue-100'}`}>
                              <div className="grid grid-cols-12 gap-2 md:gap-3 items-center mb-2">
                                <div className="col-span-5">
                                  <input
                                    placeholder="Nombre activo"
                                    value={asset.name}
                                    onChange={(e) => handleStaffAssetChange(idx, assetIdx, "name", e.target.value)}
                                    className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs md:text-sm ${themeClasses.inputBg}`}
                                    disabled={true}
                                  />
                                </div>
                                <div className="col-span-5">
                                  <input
                                    placeholder="Código"
                                    value={asset.code}
                                    onChange={(e) => handleStaffAssetChange(idx, assetIdx, "code", e.target.value)}
                                    className={`w-full px-2 py-1 md:px-3 md:py-2 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs md:text-sm ${themeClasses.inputBg}`}
                                    disabled={true}
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                <div>
                                  <label className={`block text-xs font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>Estado</label>
                                  <select
                                    value={asset.status}
                                    onChange={(e) => handleStaffAssetChange(idx, assetIdx, "status", e.target.value)}
                                    className={`w-full px-2 py-1 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs ${themeClasses.inputBg}`}
                                    disabled={true}
                                  >
                                    {Object.values(ASSET_STATUS).map(status => (
                                      <option key={status} value={status}>{status}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className={`block text-xs font-medium ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-1`}>
                                    {asset.status === ASSET_STATUS.OTRO ? 'Descripción' : 'Observaciones'}
                                  </label>
                                  <input
                                    placeholder={asset.status === ASSET_STATUS.OTRO ? 'Describe el estado' : 'Observaciones adicionales'}
                                    value={asset.description}
                                    onChange={(e) => handleStaffAssetChange(idx, assetIdx, "description", e.target.value)}
                                    className={`w-full px-2 py-1 border ${themeClasses.inputBorder} rounded focus:outline-none focus:ring-1 focus:ring-yellow-400 text-xs ${themeClasses.inputBg}`}
                                    disabled={true}
                                  />
                                </div>
                              </div>
                              
                              {asset.status && (
                                <div className={`mt-2 px-2 py-1 rounded text-xs font-medium text-center ${getStatusColor(asset.status)}`}>
                                  {asset.status}
                                  {asset.description && asset.status !== ASSET_STATUS.OPTIMO && (
                                    <span className="ml-1">: {asset.description}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </form>

              <div className={`border ${darkMode ? 'border-gray-700' : `border-[${COLOR_PALETTE.primary.main}]`} rounded-lg p-4 ${darkMode ? 'bg-gray-700' : COLOR_PALETTE.primary.light}`}>
                <h3 className={`font-semibold text-sm md:text-base ${darkMode ? 'text-blue-300' : `text-[${COLOR_PALETTE.primary.dark}]`} mb-3 flex items-center`}>
                  <span className={`inline-block w-2 h-2 md:w-3 md:h-3 ${darkMode ? `bg-[${COLOR_PALETTE.secondary.main}]` : `bg-[${COLOR_PALETTE.secondary.main}]`} rounded-full mr-1 md:mr-2`}></span>
                  Información de la Habitación
                </h3>
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-lg mb-4 flex items-center justify-center h-48 w-48">
                    <div className="text-center">
                      <div className={`text-6xl font-bold ${adminRoomsStatus[selectedAdminRoom.id] ? 'text-red-500' : 'text-green-500'}`}>
                        {selectedAdminRoom.number}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedAdminRoom.label}
                      </p>
                      <p className={`text-xs font-medium mt-1 ${adminRoomsStatus[selectedAdminRoom.id] ? 'text-red-500' : 'text-green-500'}`}>
                        {adminRoomsStatus[selectedAdminRoom.id] ? 'OCUPADA' : 'DISPONIBLE'}
                      </p>
                    </div>
                  </div>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center mb-4`}>
                    Información detallada de la habitación
                  </p>
                </div>
              </div>
            </div>
          )}
        </RoomModal>
      </div>
    </div>
  );
};

export default MapaHabitaciones;