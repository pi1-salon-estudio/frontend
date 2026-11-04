import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Marco } from './componentes/Marco.tsx'
import { Inicio } from './paginas/Inicio.tsx'
import { NoEncontrada } from './paginas/NoEncontrada.tsx'
import { PaginaSimple } from './paginas/PaginaSimple.tsx'

export default function App() {
  return (
    <BrowserRouter>
      <Marco>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route
            path="/ingreso"
            element={
              <PaginaSimple
                titulo="Ingreso"
                parrafos={[
                  'Aquí vas a entrar a tu cuenta.',
                  'Esta pantalla llega en el sprint de identidad.',
                ]}
              />
            }
          />
          <Route
            path="/registro"
            element={
              <PaginaSimple
                titulo="Registro"
                parrafos={[
                  'Aquí vas a crear tu cuenta.',
                  'Esta pantalla llega en el sprint de identidad.',
                ]}
              />
            }
          />
          <Route
            path="/panel"
            element={
              <PaginaSimple
                titulo="Panel"
                parrafos={[
                  'Aquí vas a ver tus salas.',
                  'El panel llega cuando ya exista la cuenta.',
                ]}
              />
            }
          />
          <Route
            path="/perfil"
            element={
              <PaginaSimple
                titulo="Perfil"
                parrafos={[
                  'Aquí vas a ver y editar tu perfil.',
                  'Esta pantalla llega en el sprint de perfil.',
                ]}
              />
            }
          />
          <Route
            path="/sala"
            element={
              <PaginaSimple
                titulo="Sala"
                parrafos={[
                  'Aquí vas a estudiar con tu grupo, con el trabajo a la vista.',
                  'La sala llega en un sprint posterior.',
                ]}
              />
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
                  'Hoy el inicio consulta la base técnica. El ingreso, el registro, el panel, el perfil y la sala llegan en los sprints siguientes.',
                ]}
              />
            }
          />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </Marco>
    </BrowserRouter>
  )
}
