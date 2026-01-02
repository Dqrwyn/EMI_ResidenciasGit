import { useState } from "react";
import axios from "axios";
import { User, Key } from "lucide-react";
import Particles from "react-tsparticles";
import emiLogo from "../assets/02.png";

export default function InicioSesion({ onInicioSesionExitoso }) {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [paso, setPaso] = useState(1);
  const [mensaje, setMensaje] = useState("");

  const solicitarToken = async () => {
    try {
      const respuesta = await axios.post("http://localhost:3001/solicitar-token", { email });
      setMensaje(respuesta.data.mensaje);
      setPaso(2);
    } catch {
      setMensaje("Error solicitando token");
    }
  };

  const validarToken = async () => {
    try {
      const respuesta = await axios.post("http://localhost:3001/validar-token", { email, token });
      setMensaje(respuesta.data.mensaje);
      if (respuesta.status === 200) onInicioSesionExitoso();
    } catch (error) {
      setMensaje(error.response?.data?.mensaje || "Error validando token");
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 overflow-hidden">

      <Particles
        options={{
          background: { color: { value: "transparent" } },
          fpsLimit: 60,
          interactivity: {
            events: { onHover: { enable: true, mode: "repulse" } },
            modes: { repulse: { distance: 100 } }
          },
          particles: {
            color: { value: "#ffffff" },
            links: { enable: true, color: "#ffffff", distance: 120 },
            collisions: { enable: false },
            move: { enable: true, speed: 1, outModes: { default: "bounce" } },
            number: { value: 50, density: { enable: true, area: 800 } },
            opacity: { value: 0.3 },
            shape: { type: "circle" },
            size: { value: { min: 2, max: 5 } },
          }
        }}
        className="absolute inset-0"
      />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-center max-w-6xl w-full gap-12 p-6">

        <div className="flex-1 flex flex-col items-center justify-center text-center text-white animate-aparecer-izquierda gap-4">

          <div className="w-full max-w-xs md:max-w-sm lg:max-w-md mx-auto mb-4">
            <img
              src={emiLogo}
              alt="Residencias EMI"
              className="w-full h-auto"
              style={{
                display: "block",
                objectFit: "contain",
                filter: "none",
              }}
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">
            Sistema de Gestion de Residencias
          </h1>
          <h2 className="text-xl md:text-2xl font-semibold text-yellow-300 mb-4">
            Escuela Militar de Ingenieria - Unidad Academica del Tropico
          </h2>
          <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Bienvenido al sistema que facilita la administracion y control de las residencias universitarias, 
            optimizando el registro de estudiantes, personal militar y administrativos, asignacion de cuartos 
            y gestion de activos. Todo desde una interfaz moderna, clara y eficiente.
          </p>
        </div>

        <div className="flex-1 max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center animate-aparecer-derecha">
          <h2 className="text-2xl font-bold mb-6 text-center text-blue-900">Acceso a Residencias</h2>

          {paso === 1 ? (
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-blue-500">
                <User size={20} className="text-gray-400" />
                <input
                  type="email"
                  placeholder="Ingresa tu correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full outline-none text-gray-900 bg-transparent"
                />
              </div>
              <button
                onClick={solicitarToken}
                className="bg-yellow-500 hover:bg-yellow-600 transition-all duration-200 text-white font-semibold py-3 rounded-xl shadow-md transform hover:-translate-y-1 hover:shadow-lg"
              >
                Solicitar Token
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <div className="flex items-center gap-3 p-3 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-green-500">
                <Key size={20} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="Ingresa el token recibido"
                  value={token}
                  onChange={(e) => setToken(e.target.value.trim())}
                  className="w-full outline-none text-gray-900 bg-transparent"
                />
              </div>
              <button
                onClick={validarToken}
                className="bg-green-500 hover:bg-green-600 transition-all duration-200 text-white font-semibold py-3 rounded-xl shadow-md transform hover:-translate-y-1 hover:shadow-lg"
              >
                Validar Token
              </button>
            </div>
          )}

          {mensaje && <p className="mt-4 text-center text-red-500 font-medium">{mensaje}</p>}
        </div>

      </div>

      <style jsx>{`
        .animate-aparecer-izquierda {
          animation: aparecerIzquierda 1s ease forwards;
        }
        .animate-aparecer-derecha {
          animation: aparecerDerecha 1s ease forwards;
        }
        @keyframes aparecerIzquierda {
          0% { opacity: 0; transform: translateX(-40px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes aparecerDerecha {
          0% { opacity: 0; transform: translateX(40px); }
          100% { opacity: 1; transform: translateX(0); }
        }
      `}</style>

    </div>
  );
}