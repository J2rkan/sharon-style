import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { Lock, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminLoginModal({ isOpen, onClose, onSuccess }: Props) {
  const { setAppRole, setAdminAuthenticated } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clave temporal en duro (según requerimiento)
    if (password === 'sharon2026') {
      setError(false);
      setAdminAuthenticated(true);
      setAppRole('admin');
      onSuccess();
      navigate('/'); // Redirigir al Dashboard de Admin
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-dark-card border border-[#333] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-[#333] bg-[#1a1a1a]">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Lock className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-white">Acceso Restringido</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-400">
              Por favor, ingrese la contraseña maestra para cambiar a la vista de <span className="text-white font-semibold">Caja / Administrador</span>.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <input 
                type="password"
                placeholder="Introducir Clave..."
                className={`w-full bg-[#111] border ${error ? 'border-red-500' : 'border-[#333]'} rounded-xl px-4 py-3 text-center text-xl tracking-[0.3em] text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
              {error && (
                <p className="text-red-400 text-xs mt-2 flex items-center justify-center gap-1 animate-in slide-in-from-top-1">
                  <AlertCircle className="w-3 h-3" /> Contraseña incorrecta. Intente de nuevo.
                </p>
              )}
            </div>

            <button 
              type="submit"
              disabled={password.length === 0}
              className="w-full bg-primary hover:bg-primary-dark text-dark font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Desbloquear
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
