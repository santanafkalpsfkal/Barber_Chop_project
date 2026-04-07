import './styles/globals.css';
import { useEffect } from 'react';
import Navbar      from './components/layout/Navbar';
import Footer      from './components/layout/Footer';
import Hero        from './components/sections/Hero';
import Stats       from './components/sections/Stats';
import Servicios   from './components/sections/Servicios';
import Galeria     from './components/sections/Galeria';
import Equipo      from './components/sections/Equipo';
import TarifasReserva from './components/sections/TarifasReserva';
import Ubicacion   from './components/sections/Ubicacion';
import { useAuthStore } from './store/authStore';

export default function App() {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Servicios />
        <Galeria />
        <Equipo />
        <TarifasReserva />
        <Ubicacion />
      </main>
      <Footer />
    </>
  );
}
