import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, BookOpen, Shield, AlertCircle } from 'lucide-react';
import { usePortal } from '../state/PortalContext';

// ─── Статы на левой панели ──────────────────────────────────────────────────

const STATS = [
  { icon: '📚', label: '1 248 статей', sub: 'в базе знаний' },
  { icon: '⚖️', label: '94 сценария', sub: 'инцидентов' },
  { icon: '📋', label: '312 шаблонов', sub: 'документов' },
  { icon: '🏢', label: '187 организаций', sub: 'на портале' },
];

// ─── Демо-аккаунты ──────────────────────────────────────────────────────────

const DEMO_ACCOUNTS = [
  { email: 'admin@profbaza.by', label: 'Суперадмин' },
  { email: 'editor@profbaza.by', label: 'Редактор' },
  { email: 'petrova@school12.minsk.edu.by', label: 'Администратор организации' },
  { email: 'ivanova@school12.minsk.edu.by', label: 'Учитель' },
  { email: 'belov@example.by', label: 'Пользователь' },
];

// ─── Главный компонент ───────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading, errorMessage, clearError } = usePortal();

  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const [formError, setFormError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    setFormError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError('Введите корректный email.');
      return;
    }
    if (!password) {
      setFormError('Введите пароль.');
      return;
    }

    const ok = await login(trimmedEmail, password);
    if (ok) {
      navigate('/');
    }
  }

  function handleDemoLogin(demoEmail: string) {
    setEmail(demoEmail);
    setPassword('password');
    setShowDemo(false);
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}
    >
      {/* ── Левая панель (только desktop) ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-2/5 p-10"
        style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #3730A3 60%, #1D4ED8 100%)' }}
      >
        {/* Лого */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
            <BookOpen size={18} className="text-white" />
          </div>
          <span className="text-xl font-semibold text-white">
            Проф<span style={{ color: '#93C5FD' }}>База</span>
          </span>
        </div>

        {/* Слоган и статистика */}
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Всё необходимое для вашего профессионального пути — в одном месте
          </h2>
          <p className="text-blue-200 leading-relaxed">
            База знаний, инструменты педагога, правовые документы и поддержка в сложных ситуациях.
          </p>
          <div className="grid grid-cols-2 gap-3 mt-8">
            {STATS.map(({ icon, label, sub }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl mb-1">{icon}</div>
                <p className="text-white font-semibold text-sm">{label}</p>
                <p className="text-blue-200 text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Дисклеймер */}
        <div className="flex items-start gap-3 bg-white/10 rounded-xl p-4">
          <Shield size={16} className="text-blue-300 mt-0.5 shrink-0" />
          <p className="text-xs text-blue-200">
            Материалы портала носят справочный характер. Портал не предназначен для сбора
            персональных данных в коммерческих целях.
          </p>
        </div>
      </div>

      {/* ── Правая панель (форма) ── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Мобильный лого */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
            >
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">
              Проф<span className="text-blue-600">База</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Добро пожаловать</h1>
          <p className="text-slate-500 mb-8">Войдите в свой аккаунт, чтобы продолжить</p>

          {/* Ошибка */}
          {(formError || errorMessage) && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl mb-6"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}
            >
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p className="text-sm">{formError || errorMessage}</p>
            </div>
          )}

          {/* Форма */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError(); setFormError(''); }}
              placeholder="your@email.by"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1.5">Пароль</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600" />
                <span className="text-sm text-slate-600">Запомнить меня</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">Забыли пароль?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="block w-full py-3 rounded-xl text-sm font-semibold text-white text-center transition-colors disabled:opacity-60"
              style={{ background: '#2563EB' }}
            >
              {isLoading ? 'Выполняется вход...' : 'Войти'}
            </button>
          </form>

          {/* Демо-аккаунты */}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowDemo(!showDemo)}
              className="w-full text-xs text-slate-400 hover:text-slate-600 transition-colors py-1"
            >
              🔑 Демо-аккаунты для тестирования {showDemo ? '▲' : '▼'}
            </button>
            {showDemo && (
              <div
                className="mt-2 rounded-xl overflow-hidden"
                style={{ border: '1px solid #E2E8F0' }}
              >
                {DEMO_ACCOUNTS.map(({ email: demoEmail, label }) => (
                  <button
                    key={demoEmail}
                    type="button"
                    onClick={() => handleDemoLogin(demoEmail)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-0"
                  >
                    <span className="text-xs font-medium text-slate-700">{label}</span>
                    <span className="text-xs text-slate-400">{demoEmail}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
