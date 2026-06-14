import { Link, Outlet, useLocation } from 'react-router';
import { usePortal } from '../state/PortalContext';

export default function ProtectedRoute() {
  const { currentUser, isLoading } = usePortal();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-blue-100 bg-white p-6 sm:p-8 shadow-sm">
          <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-4">
            Гостевой просмотр
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Войдите, чтобы открыть этот раздел</h1>
          <p className="mt-3 text-slate-600 max-w-2xl">
            Сейчас доступна открытая часть портала: новости, часть базы знаний и оглавление правового раздела.
            Для персональных рекомендаций, организации и кабинета нужен аккаунт.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/login"
              state={{ from: location }}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Войти
            </Link>
            <Link
              to="/register"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Зарегистрироваться
            </Link>
            <Link
              to="/"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.isBanned) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-2xl border border-red-100 bg-white p-6 sm:p-8 shadow-sm">
          <div className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 mb-4">
            Доступ ограничен
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Аккаунт заблокирован</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Для этого пользователя закрыты персональные разделы, кабинет, организация и административные функции.
            Если блокировка ошибочная, обратитесь к администратору портала.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              На главную
            </Link>
            <Link
              to="/news"
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Открытые новости
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
