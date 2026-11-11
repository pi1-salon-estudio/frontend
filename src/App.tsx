import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Marco } from './componentes/Marco.tsx'
import { ElegirUsuario } from './paginas/ElegirUsuario.tsx'
import { Ingreso } from './paginas/Ingreso.tsx'
import { Inicio } from './paginas/Inicio.tsx'
import { NoEncontrada } from './paginas/NoEncontrada.tsx'
import { PaginaSimple } from './paginas/PaginaSimple.tsx'
import { Panel } from './paginas/Panel.tsx'
import { Registro } from './paginas/Registro.tsx'
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
                  <PaginaSimple
                    titulo="Perfil"
                    parrafos={[
                      'Aquí vas a ver y editar tu perfil.',
                      'Esta pantalla llega en el sprint de perfil.',
                    ]}
                  />
                </RutaConPerfil>
              }
            />
            <Route
              path="/sala"
              element={
                <RutaConPerfil>
                  <PaginaSimple
                    titulo="Sala"
                    parrafos={[
                      'Aquí vas a estudiar con tu grupo, con el trabajo a la vista.',
                      'La sala llega en un sprint posterior.',
                    ]}
                  />
                </RutaConPerfil>
              }
            />
            <Route
              path="/ayuda"
              element={
                <PaginaSimple
                  titulo="Ayuda"
                  parrafos={[
                    'Puedes moverte con el teclado. Tab avanza, Mayús+Tab retrocede y Entrar activa el enlace o el botón que tiene el foco.',
                    'Al inicio de cada página está el enlace «Saltar al contenido».',
                    'Puedes crear tu cuenta en Registro y entrar en Ingreso, con correo o con Google. Panel, perfil y sala piden una sesión. Si entras con Google por primera vez, eliges un nombre de usuario antes de continuar.',
                  ]}
                />
              }
            />
            <Route path="*" element={<NoEncontrada />} />
          </Routes>
        </Marco>
      </ProveedorSesion>
    </BrowserRouter>
  )
}
