import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ambilProfil, ambilPengaturan } from './lib/db.js';
import { mulaiSinkronOtomatis } from './lib/sinkron.js';
import Onboarding from './pages/Onboarding.jsx';
import Beranda from './pages/Beranda.jsx';
import Modul from './pages/Modul.jsx';
import Tes from './pages/Tes.jsx';
import Progres from './pages/Progres.jsx';
import Pengaturan from './pages/Pengaturan.jsx';
import Lab from './pages/Lab.jsx';
import GuruMasuk from './pages/guru/GuruMasuk.jsx';
import GuruKelas from './pages/guru/GuruKelas.jsx';

const KonteksProfil = createContext({ profil: null, muatUlang: async () => {} });
export const useProfil = () => useContext(KonteksProfil);

function Penjaga({ profil, children }) {
  const lokasi = useLocation();
  if (!profil && !lokasi.pathname.startsWith('/guru') && lokasi.pathname !== '/mulai') {
    return <Navigate to="/mulai" replace />;
  }
  return children;
}

export default function App() {
  const [siap, setSiap] = useState(false);
  const [profil, setProfil] = useState(null);

  const muatUlang = useCallback(async () => {
    const [p, atur] = await Promise.all([ambilProfil(), ambilPengaturan()]);
    setProfil(p);
    document.documentElement.dataset.huruf = atur.ukuranHuruf;
    return p;
  }, []);

  useEffect(() => {
    muatUlang().finally(() => setSiap(true));
    return mulaiSinkronOtomatis();
  }, [muatUlang]);

  if (!siap) return <p className="tengah muted" style={{ marginTop: '40vh' }}>Memuat…</p>;

  return (
    <KonteksProfil.Provider value={{ profil, muatUlang }}>
      <HashRouter>
        <Penjaga profil={profil}>
          <Routes>
            <Route path="/mulai" element={<Onboarding />} />
            <Route path="/" element={<Beranda />} />
            <Route path="/modul/:id" element={<Modul />} />
            <Route path="/tes/:jenis" element={<Tes />} />
            <Route path="/progres" element={<Progres />} />
            <Route path="/pengaturan" element={<Pengaturan />} />
            <Route path="/lab" element={<Lab />} />
            <Route path="/guru" element={<GuruMasuk />} />
            <Route path="/guru/kelas/:id" element={<GuruKelas />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Penjaga>
      </HashRouter>
    </KonteksProfil.Provider>
  );
}
