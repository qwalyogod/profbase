import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { usePortal } from '../state/PortalContext';

const SPECIALIZATIONS = [
  'Педагогика / Образование',
  'Математика',
  'Информатика',
  'Русский язык и литература',
  'История и обществознание',
  'Иностранные языки',
  'Физика / Химия / Биология',
  'Физическая культура',
  'Начальные классы',
  'Воспитатель / ДОУ',
  'Другое',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { registerUser, isLoading, errorMessage, clearError } = usePortal();

  const [showPass, setShowPass] = useState(false);
  const [step, setStep] = useState(1);

  // Шаг 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step1Error, setStep1Error] = useState('');

  // Шаг 2
  const [specialization, setSpecialization] = useState('');
  const [isYoung, setIsYoung] = useState<boolean | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState('');

  // Сила пароля
  function passwordStrength(p: string): number {
    if (p.length === 0) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }
  const strength = passwordStrength(password);
  const strengthColors = ['#E2E8F0', '#EF4444', '#F59E0B', '#10B981', '#2563EB'];
  const strengthLabels = ['', 'Слабый', 'Средний', 'Хороший', 'Надёжный'];

  function goToStep2(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    setStep1Error('');
    if (!firstName.trim() || !lastName.trim()) {
      setStep1Error('Введите имя и фамилию.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStep1Error('Введите корректный email.');
      return;
    }
    if (password.length < 6) {
      setStep1Error('Пароль должен быть не менее 6 символов.');
      return;
    }
    if (password !== confirm) {
      setStep1Error('Пароли не совпадают.');
      return;
    }
    setStep(2);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    if (!agreed) {
      setAgreeError('Необходимо принять пользовательское соглашение, чтобы зарегистрироваться.');
      return;
    }
    setAgreeError('');

    try {
      await registerUser({
        firstName,
        lastName,
        email,
        password,
        specialization: specialization || undefined,
        isYoungSpecialist: isYoung ?? undefined,
        inviteCode: inviteCode || undefined,
      });
      navigate('/onboarding');
    } catch {
      // ошибка уже в errorMessage через контекст
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}
    >
      <div className="w-full max-w-md">

        {/* Лого */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}
            >
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-900">
              Проф<span className="text-blue-600">База</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Создать аккаунт</h1>
          <p className="text-slate-500 mt-1">Зарегистрируйтесь бесплатно за 2 минуты</p>
        </div>

        {/* Индикатор шагов */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2].map(s => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold shrink-0"
                style={{
                  background: step > s ? '#10B981' : step === s ? '#2563EB' : '#E2E8F0',
                  color: step >= s ? '#fff' : '#94A3B8',
                }}
              >
                {step > s ? <CheckCircle size={14} /> : s}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: step === s ? '#2563EB' : '#94A3B8' }}
              >
                {s === 1 ? 'Личные данные' : 'Дополнительно'}
              </span>
              {s < 2 && (
                <div
                  className="flex-1 h-0.5"
                  style={{ background: step > s ? '#10B981' : '#E2E8F0' }}
                />
              )}
            </div>
          ))}
        </div>

        <div
          className="bg-white rounded-2xl p-6 sm:p-8"
          style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', border: '1px solid #E2E8F0' }}
        >
          {/* Ошибка контекста */}
          {errorMessage && (
            <div
              className="flex items-start gap-3 p-3 rounded-xl mb-4"
              style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}
            >
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {step === 1 ? (
            /* ── Шаг 1: Личные данные ── */
            <form className="space-y-4" onSubmit={goToStep2}>
              {step1Error && (
                <div
                  className="flex items-start gap-2 p-3 rounded-xl text-sm"
                  style={{ background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }}
                >
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  {step1Error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Имя</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Анна"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Фамилия</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Иванова"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.by"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Пароль</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    required
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Полоска силы пароля */}
                {password.length > 0 && (
                  <>
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map(i => (
                        <div
                          key={i}
                          className="flex-1 h-1.5 rounded-full transition-colors"
                          style={{ background: i <= strength ? strengthColors[strength] : '#E2E8F0' }}
                        />
                      ))}
                    </div>
                    <p className="text-xs mt-1" style={{ color: strengthColors[strength] }}>
                      {strengthLabels[strength]}
                    </p>
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Подтвердите пароль</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl text-sm font-semibold text-white mt-2"
                style={{ background: '#2563EB' }}
              >
                Продолжить →
              </button>
            </form>
          ) : (
            /* ── Шаг 2: Доп. данные ── */
            <form className="space-y-4" onSubmit={handleRegister}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Специализация</label>
                <select
                  value={specialization}
                  onChange={e => setSpecialization(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Выберите специализацию</option>
                  {SPECIALIZATIONS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Вы молодой специалист?</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: true, label: 'Да, молодой специалист' },
                    { val: false, label: 'Нет' },
                  ].map(({ val, label }) => (
                    <label
                      key={label}
                      className="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors"
                      style={{
                        borderColor: isYoung === val ? '#3B82F6' : '#E2E8F0',
                        background: isYoung === val ? '#EFF6FF' : '#fff',
                      }}
                    >
                      <input
                        type="radio"
                        name="young"
                        checked={isYoung === val}
                        onChange={() => setIsYoung(val)}
                        className="text-blue-600"
                      />
                      <span className="text-sm text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Код приглашения организации{' '}
                  <span className="text-slate-400 font-normal">(необязательно)</span>
                </label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={e => setInviteCode(e.target.value.toUpperCase())}
                  placeholder="SCH-2026-XXXX"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <label className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer ${agreeError ? 'bg-red-50 border border-red-200' : 'bg-blue-50'}`}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => { setAgreed(e.target.checked); if (e.target.checked) setAgreeError(''); }}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600"
                />
                <p className="text-xs text-slate-600">
                  Я прочитал(а) и принимаю{' '}
                  <Link to="/terms" target="_blank" rel="noreferrer" className="text-blue-600 underline">Пользовательское соглашение</Link>{' '}
                  (условия использования) портала «ПрофБаза».
                </p>
              </label>
              {agreeError ? (
                <p className="flex items-center gap-1.5 text-xs text-red-600"><AlertCircle size={13} /> {agreeError}</p>
              ) : null}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  ← Назад
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                  style={{ background: '#2563EB' }}
                >
                  {isLoading ? 'Создание...' : 'Зарегистрироваться'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-blue-600 font-medium hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
