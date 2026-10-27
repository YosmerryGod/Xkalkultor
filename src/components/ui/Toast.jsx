import { useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const STYLES = {
  success: 'bg-emerald-600',
  error: 'bg-red-500',
  info: 'bg-gray-800',
};

const Toast = () => {
  const { toast, setToast } = useApp();

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast, setToast]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none absolute bottom-28 left-0 right-0 z-[70] flex justify-center px-6" role="status" aria-live="polite">
      <div className={`px-4 py-2.5 rounded-2xl text-xs font-semibold text-white shadow-lg text-center ${STYLES[toast.type] || STYLES.info}`}>
        {toast.message}
      </div>
    </div>
  );
};

export default Toast;
