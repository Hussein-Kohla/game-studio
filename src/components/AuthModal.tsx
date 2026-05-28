import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/Button';
import toast from 'react-hot-toast';
import { UserCircle2, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { user, login, logout } = useAuthStore();
  const loginOrRegister = useMutation(api.users.loginOrRegister);

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      toast.error('يرجى إدخال الاسم وكلمة المرور');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginOrRegister({ name: name.trim(), password });
      login(result.user!, result.progress as any);
      toast.success(`أهلاً بك يا ${result.user!.name}!`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-slate-900 border border-purple-500/30 rounded-3xl w-full max-w-md p-6 relative shadow-[0_0_40px_rgba(168,85,247,0.2)]">
        
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6 mt-4">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4 text-purple-400">
            <UserCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-white text-center">
            {user ? 'حسابك الشخصي' : 'تسجيل حساب'}
          </h2>
          {!user && (
            <p className="text-sm text-slate-400 text-center mt-2 font-semibold">
              سجل حساب لعدم تكرار الأسئلة والكلمات!
            </p>
          )}
        </div>

        {user ? (
          <div className="flex flex-col gap-4">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
              <p className="text-slate-400 text-sm mb-1">اسم المستخدم</p>
              <p className="text-white font-bold text-xl">{user.name}</p>
            </div>
            <Button variant="danger" className="w-full py-3 text-lg" onClick={handleLogout}>
              تسجيل الخروج
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">الاسم (اسم حفظ البيانات)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك..."
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                maxLength={30}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2">كلمة المرور (سهلة، بدون قيود)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور..."
                className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full py-4 text-lg mt-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-none shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              disabled={isLoading}
            >
              {isLoading ? 'جاري التسجيل...' : 'دخول / تسجيل جديد'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
