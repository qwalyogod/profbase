import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { usePortal } from '../state/PortalContext';
import { describeUserRole } from '../lib/portalHelpers';
import {
  Bell, Bookmark, Shield, Mail, Key, User, Upload, CheckCircle2, AlertCircle, Tags, Loader2, LifeBuoy,
} from 'lucide-react';
import { articles as knowledgeArticles } from './KnowledgeBasePage';
import SupportPanel from '../components/common/SupportPanel';

const getSavedArticleStorageKey = (userId: string) => `saved_article_ids:${userId}`;

export default function ProfilePage() {
  const { currentUser, database, updateProfile, updatePassword, uploadAvatar, getNotificationHistory } = usePortal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [avatarError, setAvatarError] = useState('');
  const [avatarSuccess, setAvatarSuccess] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  // Personal data (name)
  const [profileForm, setProfileForm] = useState({ lastName: '', firstName: '' });
  const [seededFor, setSeededFor] = useState<string | null>(null);
  const [nameStatus, setNameStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);

  // Email change
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [emailStatus, setEmailStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  useEffect(() => {
    if (currentUser && seededFor !== currentUser.id) {
      const parts = currentUser.fullName.trim().split(/\s+/);
      setProfileForm({ lastName: parts[0] ?? '', firstName: parts.slice(1).join(' ') });
      setEmailForm({ email: currentUser.email ?? '', password: '' });
      setSeededFor(currentUser.id);
    }
  }, [currentUser, seededFor]);

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <p className="text-slate-500">Пожалуйста, войдите в систему.</p>
      </div>
    );
  }

  const savedKnowledgeIds = (() => {
    try {
      const raw = localStorage.getItem(getSavedArticleStorageKey(currentUser.id));
      return raw ? (JSON.parse(raw) as number[]) : [];
    } catch {
      return [];
    }
  })();

  const getKnowledgeTitle = (id: number) =>
    knowledgeArticles.find((article) => article.id === id)?.title ?? `Материал базы знаний #${id}`;
  const notificationHistory = getNotificationHistory(currentUser.id);
  const displayedNotifications = showAllNotifications ? notificationHistory : notificationHistory.slice(0, 5);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameStatus(null);
    const lastName = profileForm.lastName.trim();
    const firstName = profileForm.firstName.trim();
    if (!lastName && !firstName) {
      setNameStatus({ ok: false, text: 'Укажите имя и фамилию.' });
      return;
    }
    const fullName = [lastName, firstName].filter(Boolean).join(' ');
    setIsSavingName(true);
    try {
      await updateProfile({ fullName });
      setNameStatus({ ok: true, text: 'Имя обновлено.' });
    } catch (err) {
      setNameStatus({ ok: false, text: err instanceof Error ? err.message : 'Не удалось сохранить.' });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailStatus(null);
    const email = emailForm.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus({ ok: false, text: 'Введите корректный email.' });
      return;
    }
    if (!emailForm.password) {
      setEmailStatus({ ok: false, text: 'Подтвердите смену почты текущим паролем.' });
      return;
    }
    setIsSavingEmail(true);
    try {
      await updateProfile({ email, currentPassword: emailForm.password });
      setEmailStatus({ ok: true, text: 'Email обновлён.' });
      setEmailForm((prev) => ({ ...prev, password: '' }));
    } catch (err) {
      setEmailStatus({ ok: false, text: err instanceof Error ? err.message : 'Не удалось сохранить.' });
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    if (!currentPassword) {
      setPasswordError('Введите текущий пароль');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Новый пароль должен содержать минимум 6 символов');
      return;
    }
    setIsUpdatingPassword(true);
    try {
      await updatePassword(currentPassword, newPassword);
      setPasswordSuccess('Пароль успешно изменен');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Ошибка смены пароля');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');
    setAvatarSuccess('');
    setIsUploadingAvatar(true);
    try {
      await uploadAvatar(file);
      setAvatarSuccess('Фотография обновлена.');
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Ошибка загрузки аватара');
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Мой профиль</h1>
        <p className="text-sm text-slate-500 mt-1">Управление настройками аккаунта и безопасностью</p>
      </div>

      {/* Профиль + аватар */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="relative group">
              <div className="w-28 h-28 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Аватар" className="w-full h-full object-cover" />
                ) : (
                  <User size={44} className="text-blue-300" />
                )}
              </div>
              {isUploadingAvatar ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-900/50 text-white">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              <Upload size={13} /> {currentUser.avatarUrl ? 'Изменить фото' : 'Загрузить фото'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/webp, image/gif"
              className="hidden"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-slate-900 truncate">{currentUser.fullName}</h2>
            <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
              <Mail size={14} className="text-slate-400 shrink-0" />
              <span className="truncate">{currentUser.email || 'Нет Email'}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5">
              <Shield size={14} className="text-blue-500 shrink-0" />
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                {describeUserRole(currentUser, database.memberships, database.organizations)}
              </span>
            </div>
            {(currentUser.specialtyTagIds ?? []).length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {(currentUser.specialtyTagIds ?? []).map((tagId) => (
                  <span key={tagId} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                    <Tags size={12} />
                    {database.specialtyTags.find((tag) => tag.id === tagId)?.name ?? tagId}
                  </span>
                ))}
              </div>
            ) : null}
            {avatarSuccess ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle2 size={14} /> {avatarSuccess}
              </p>
            ) : null}
            {avatarError ? (
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle size={14} /> {avatarError}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Личные данные */}
      <div id="settings" className="scroll-mt-24 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <User size={18} className="text-blue-500" /> Личные данные
        </h3>
        <form onSubmit={handleSaveName} className="space-y-4 max-w-md">
          {nameStatus ? (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${nameStatus.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {nameStatus.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {nameStatus.text}
            </div>
          ) : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Фамилия</label>
              <input value={profileForm.lastName} onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Имя</label>
              <input value={profileForm.firstName} onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))} className={inputClass} />
            </div>
          </div>
          <button type="submit" disabled={isSavingName} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400">
            {isSavingName ? 'Сохранение...' : 'Сохранить имя'}
          </button>
        </form>
      </div>

      {/* Email */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <Mail size={18} className="text-blue-500" /> Электронная почта
        </h3>
        <p className="text-sm text-slate-500 mb-4">Для смены почты подтвердите действие текущим паролем.</p>
        <form onSubmit={handleSaveEmail} className="space-y-4 max-w-md">
          {emailStatus ? (
            <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${emailStatus.ok ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
              {emailStatus.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {emailStatus.text}
            </div>
          ) : null}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Новый email</label>
            <input type="email" value={emailForm.email} onChange={(e) => setEmailForm((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Текущий пароль</label>
            <input type="password" value={emailForm.password} onChange={(e) => setEmailForm((p) => ({ ...p, password: e.target.value }))} className={inputClass} />
          </div>
          <button type="submit" disabled={isSavingEmail} className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400">
            {isSavingEmail ? 'Сохранение...' : 'Сохранить email'}
          </button>
        </form>
      </div>

      {/* Поддержка */}
      <div id="support" className="scroll-mt-24 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-1 flex items-center gap-2">
          <LifeBuoy size={18} className="text-blue-500" /> Обращение в поддержку
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          Опишите проблему или вопрос — обращение получит глобальный администратор и ответит в уведомлениях.
        </p>
        <SupportPanel />
      </div>

      <div id="notifications" className="scroll-mt-24 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Bell size={18} className="text-blue-500" /> История уведомлений
        </h3>
        {notificationHistory.length === 0 ? (
          <p className="text-sm text-slate-500">Уведомлений пока нет.</p>
        ) : (
          <div className="space-y-3">
            {displayedNotifications.map((notification) => (
              <div key={notification.id} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] text-blue-700">
                    {notification.organizationId ? 'Организация' : 'Админ'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {notification.senderLabel} · {new Date(notification.createdAt).toLocaleDateString('ru-RU')}
                </p>
              </div>
            ))}
            {notificationHistory.length > 5 ? (
              <button
                type="button"
                onClick={() => setShowAllNotifications((value) => !value)}
                className="text-sm font-semibold text-blue-700 hover:underline"
              >
                {showAllNotifications ? 'Свернуть' : `Показать все (${notificationHistory.length})`}
              </button>
            ) : null}
          </div>
        )}
      </div>

      {/* Избранное */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Bookmark size={18} className="text-amber-500" /> Избранное
        </h3>
        {savedKnowledgeIds.length === 0 && !(currentUser.favoriteItemIds ?? []).length ? (
          <p className="text-sm text-slate-500">Пока нет сохраненных материалов. Добавляйте статьи в избранное из базы знаний.</p>
        ) : (
          <div className="space-y-2">
            {savedKnowledgeIds.map((id) => (
              <Link
                key={`knowledge-${id}`}
                to={`/knowledge?id=${id}`}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 hover:bg-amber-50"
              >
                <span>{getKnowledgeTitle(id)}</span>
                <span className="text-xs text-slate-500">Открыть</span>
              </Link>
            ))}
            {(currentUser.favoriteItemIds ?? []).map((itemId) => (
              <div key={itemId} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {itemId}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Смена пароля */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-6">
          <Key size={20} className="text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900">Безопасность</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          {passwordError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 size={16} /> {passwordSuccess}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Текущий пароль</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Новый пароль</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Подтвердите новый пароль</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={inputClass} />
          </div>

          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-medium transition-colors"
          >
            {isUpdatingPassword ? 'Сохранение...' : 'Обновить пароль'}
          </button>
        </form>
      </div>
    </div>
  );
}
