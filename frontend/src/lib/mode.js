/**
 * Mode pratinjau (build dengan VITE_DEMO=1): untuk link pratinjau tanpa server,
 * misalnya halaman Artifact claude.ai. Fitur yang butuh server atau service worker
 * (pasang aplikasi, offline, gabung kelas, dasbor guru, unduh berkas) disembunyikan.
 */
export const DEMO = import.meta.env.VITE_DEMO === '1';
