import React from "react";

export default function Navbar() {
  return (
    <div className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-semibold text-blue-800">Sistema de Gestión</h1>
      <div className="text-sm text-gray-600">Usuario: Admin</div>
    </div>
  );
}
