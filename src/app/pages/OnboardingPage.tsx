import { useState } from 'react';
import { Link } from 'react-router';
import {
  CheckCircle,
  ChevronRight,
  ArrowLeft,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Code,
  Users,
  Star,
  BookOpen,
  AlertTriangle,
  Loader2,
  UserCircle,
  Heart,
  FileText,
} from 'lucide-react';
import { usePortal } from '../state/PortalContext';

const specializations = [
  { id: 'pedagogy', label: 'Педагогика', icon: GraduationCap, color: '#7C3AED' },
  { id: 'medicine', label: 'Медицина', icon: Stethoscope, color: '#059669' },
  { id: 'it', label: 'Информационные технологии', icon: Code, color: '#2563EB' },
  { id: 'law', label: 'Право', icon: Briefcase, color: '#D97706' },
  { id: 'social', label: 'Социальная работа', icon: Users, color: '#0891B2' },
  { id: 'other', label: 'Другая специальность', icon: Star, color: '#64748B' },
];

const recommendations = [
  { icon: BookOpen, label: 'База знаний для педагогов', path: '/knowledge', color: '#7C3AED' },
  { icon: Briefcase, label: 'Материалы по трудоустройству', path: '/employment', color: '#2563EB' },
  { icon: AlertTriangle, label: 'Раздел сложных ситуаций', path: '/incidents', color: '#D97706' },
  { icon: GraduationCap, label: 'Педагогический кабинет', path: '/ped', color: '#059669' },
];

const steps = ['Специализация', 'Новый сотрудник', 'Опыт работы', 'Код приглашения', 'Профиль', 'Готово'];

export default function OnboardingPage() {
  const { submitJoinRequest, isLoading, errorMessage, clearError } = usePortal();

  const [step, setStep] = useState(0);
  const [spec, setSpec] = useState('');
  const [isYoungSpec, setIsYoungSpec] = useState<boolean | null>(null);
  const [isFirstJob, setIsFirstJob] = useState<boolean | null>(null);
  const [inviteCode, setInviteCode] = useState('');

  const canNext = () => {
    if (step === 0) return !!spec;
    if (step === 1) return isYoungSpec !== null;
    if (step === 2) return isFirstJob !== null;
    if (step === 3) return true;
    if (step === 4) return true;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: '#F8FAFC' }}>
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
              <BookOpen size={18} className="text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">Проф<span className="text-blue-600">База</span></span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Помощь при первом входе</h1>
          <p className="text-slate-500 mt-1">Короткая настройка, чтобы показать вам нужные материалы</p>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-2">
            <span>{errorMessage}</span>
            <button onClick={clearError} className="text-red-600 hover:underline">Закрыть</button>
          </div>
        ) : null}

        <div className="mb-8 overflow-x-auto pb-2">
          <div className="relative min-w-[620px] sm:min-w-0 px-5">
            <div className="absolute left-[52px] right-[52px] top-5 h-1 rounded-full bg-slate-200" />
            <div
              className="absolute left-[52px] top-5 h-1 rounded-full bg-blue-600 transition-all"
              style={{ width: `calc((100% - 104px) * ${step / (steps.length - 1)})` }}
            />
            <div className="relative grid grid-cols-6 gap-3">
              {steps.map((title, index) => {
                const isDone = index < step;
                const isActive = index === step;
                return (
                  <div key={title} className="flex flex-col items-center text-center">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-base font-bold transition-all shadow-sm ${
                        isDone || isActive
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-slate-200 text-slate-400 ring-4 ring-slate-100'
                      }`}
                    >
                      {isDone ? <CheckCircle size={19} /> : index + 1}
                    </div>
                    <span className={`text-xs mt-2 whitespace-nowrap ${isActive ? 'text-blue-700 font-semibold' : 'text-slate-500'}`}>
                      {title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          {step === 0 ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Выберите вашу специализацию</h2>
              <p className="text-sm text-slate-500 mb-6">Это поможет показывать подходящие материалы</p>
              <div className="grid grid-cols-2 gap-3">
                {specializations.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSpec(item.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left ${
                      spec === item.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: item.color + '15' }}>
                      <item.icon size={18} style={{ color: item.color }} />
                    </div>
                    <span className={`text-sm font-medium ${spec === item.id ? 'text-blue-700' : 'text-slate-700'}`}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Вы молодой специалист?</h2>
              <p className="text-sm text-slate-500 mb-6">Покажем дополнительные меры поддержки для начинающих специалистов</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: true, label: 'Да, молодой специалист' },
                  { value: false, label: 'Нет' },
                ].map((option) => (
                  <button
                    key={String(option.value)}
                    onClick={() => setIsYoungSpec(option.value)}
                    className={`p-5 rounded-xl border-2 text-center ${
                      isYoungSpec === option.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`text-sm font-semibold ${isYoungSpec === option.value ? 'text-blue-700' : 'text-slate-800'}`}>{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Это ваше первое трудоустройство?</h2>
              <p className="text-sm text-slate-500 mb-6">Мы подберем более подробные подсказки по оформлению документов</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: true, label: 'Да, первое место работы' },
                  { value: false, label: 'Нет, уже работал(а)' },
                ].map((option) => (
                  <button
                    key={String(option.value)}
                    onClick={() => setIsFirstJob(option.value)}
                    className={`p-5 rounded-xl border-2 text-center ${
                      isFirstJob === option.value ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className={`text-sm font-semibold ${isFirstJob === option.value ? 'text-blue-700' : 'text-slate-800'}`}>{option.label}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Присоединение к организации</h2>
              <p className="text-sm text-slate-500 mb-6">Введите код приглашения, если хотите сразу отправить заявку на вступление в организацию</p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Код приглашения</label>
                <input
                  type="text"
                  value={inviteCode}
                  onChange={(event) => setInviteCode(event.target.value.toUpperCase())}
                  placeholder="Например: SCH-2026-K8X4"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono tracking-wider"
                />
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600">
                <p className="font-medium text-slate-700 mb-1">Что будет дальше?</p>
                <ul className="space-y-1 text-xs text-slate-500">
                  <li>• Система создаст заявку на вступление</li>
                  <li>• Администратор организации проверит заявку</li>
                  <li>• После одобрения откроется доступ к документам организации</li>
                </ul>
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2">Настройте профиль и начните пользоваться</h2>
              <p className="text-sm text-slate-500 mb-6">Несколько полезных действий, которые помогут освоиться</p>
              <div className="space-y-3">
                {[
                  { icon: UserCircle, label: 'Заполните профиль', desc: 'Фото, ФИО и контакты — чтобы коллеги вас узнали', path: '/profile', color: '#2563EB' },
                  { icon: FileText, label: 'Изучите документы', desc: 'В организации есть готовые шаблоны и инструкции', path: '/ped/documents', color: '#059669' },
                  { icon: Heart, label: 'Добавьте в избранное', desc: 'Сохраняйте полезные статьи из базы знаний', path: '/knowledge', color: '#D97706' },
                ].map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl shrink-0 flex items-center justify-center" style={{ background: item.color + '15' }}>
                      <item.icon size={20} style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Настройка завершена</h2>
              <p className="text-sm text-slate-500 mb-8">Мы подготовили для вас подходящие разделы и рекомендации</p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {recommendations.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: item.color + '15' }}>
                      <item.icon size={20} style={{ color: item.color }} />
                    </div>
                    <span className="text-xs font-medium text-slate-700 text-center">{item.label}</span>
                  </Link>
                ))}
              </div>

              <Link to="/" className="block w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background: '#2563EB' }}>
                Перейти на главную
              </Link>
            </div>
          ) : null}

          {step < 5 ? (
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(Math.max(0, step - 1))}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  step === 0 ? 'invisible' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowLeft size={16} /> Назад
              </button>
              <button
                onClick={async () => {
                  if (step === 3) {
                    if (inviteCode.trim()) {
                      try {
                        await submitJoinRequest(inviteCode);
                      } catch {
                        return;
                      }
                    }
                  }
                  setStep(step + 1);
                }}
                disabled={!canNext() || isLoading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: '#2563EB' }}
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                {step === 4 ? 'Завершить' : 'Далее'} <ChevronRight size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
