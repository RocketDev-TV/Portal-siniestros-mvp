import { GitHubIcon } from './icons';

// TODO: reemplazar por la URL real del repositorio cuando se publique.
const REPO_URL = 'https://github.com/RocketDev-TV/Portal-siniestros-mvp';

export default function AppFooter() {
  return (
    <>
      <footer className="w-full border-t border-slate-200 bg-white/70 px-6 py-3 text-center text-xs text-slate-400">
        © 2026 Ignacio Ivan Herrera Gomez. Todos los derechos reservados.
      </footer>

      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-medium text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5"
      >
        <GitHubIcon className="w-4 h-4" />
        <span>Ver repo en Github</span>
      </a>
    </>
  );
}
