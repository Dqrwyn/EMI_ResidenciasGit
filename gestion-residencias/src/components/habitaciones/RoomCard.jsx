import React from "react";
import { motion } from "framer-motion";
import { getGlobalRoomNumber, ROOM_TYPES, COLOR_PALETTE } from "../utils/constants";

const RoomCard = ({ 
  roomId, 
  building, 
  floor, 
  side, 
  roomNumber, 
  roomType, 
  isOccupied, 
  occupantsCount, 
  hasPaymentIssue, 
  onSelect, 
  darkMode 
}) => {
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
      onClick={() => onSelect({
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
      hover:shadow-md hover:ring-1 md:hover:ring-2 ${darkMode ? `hover:ring-[${COLOR_PALETTE.secondary.main}]` : `hover:ring-[${COLOR_PALETTE.secondary.main}]`}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isOccupied && occupantsCount > 0 && (
        <motion.span 
          className={`absolute -top-1 -right-1 ${darkMode ? `bg-[${COLOR_PALETTE.secondary.main}]` : `bg-[${COLOR_PALETTE.secondary.main}]`} text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {occupantsCount}
        </motion.span>
      )}
      {isOccupied && hasPaymentIssue && (
        <motion.span 
          className={`absolute -bottom-1 -right-1 ${darkMode ? 'bg-red-600' : 'bg-red-500'} text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          title="Problemas de pago"
        >
          !
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
};

export default RoomCard;