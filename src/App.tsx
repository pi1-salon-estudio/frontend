import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Marco } from './componentes/Marco.tsx'
import { Ayuda } from './paginas/Ayuda.tsx'
import { ElegirUsuario } from './paginas/ElegirUsuario.tsx'
import { Ingreso } from './paginas/Ingreso.tsx'
import { Inicio } from './paginas/Inicio.tsx'
import { NoEncontrada } from './paginas/NoEncontrada.tsx'
import { Panel } from './paginas/Panel.tsx'
import { Perfil } from './paginas/Perfil.tsx'
import { Registro } from './paginas/Registro.tsx'
import { Sala } from './paginas/Sala.tsx'
import { ProveedorSesion } from './sesion/ProveedorSesion.tsx'
import { RutaConPerfil } from './sesion/RutaConPerfil.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <ProveedorSesion>
        <Marco>
          <Routes>
            <Route path="/" element={<Inicio />} />
            <Route path="/ingreso" element={<Ingreso />} />
            <Route path="/registro" element={<Registro />} />
            <Route path="/registro/usuario" element={<ElegirUsuario />} />
            <Route
              path="/panel"
              element={
                <RutaConPerfil>
                  <Panel />
                </RutaConPerfil>
              }
            />
            <Route
              path="/perfil"
              element={
                <RutaConPerfil>
                  <Perfil />
                </RutaConPerfil>
              }
            />
            <Route
              path="/sala"
              element={
                <RutaConPerfil>
                  <Sala />
                </RutaConPerfil>
              }
            />
            <Route path="/ayuda" element={<Ayuda />} />
            <Route path="*" element={<NoEncontrada />} />
          </Routes>
        </Marco>
      </ProveedorSesion>
    </BrowserRouter>
  )
}
