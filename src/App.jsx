import './styles/globals.css';
import { useEffect } from 'react';
import Navbar      from './components/layout/Navbar';
import Footer      from './components/layout/Footer';
import Hero        from './components/sections/Hero';
import AdminPanel  from './components/sections/AdminPanel';
import Stats       from './components/sections/Stats';
import Servicios   from './components/sections/Servicios';
import Galeria     from './components/sections/Galeria';
import Equipo      from './components/sections/Equipo';
import TarifasReserva from './components/sections/TarifasReserva';
import Ubicacion   from './components/sections/Ubicacion';
import { useAuthStore } from './store/authStore';
import { useCatalogStore } from './store/catalogStore';

export default function App() {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);
  const fetchCatalog = useCatalogStore((state) => state.fetchCatalog);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AdminPanel />
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
