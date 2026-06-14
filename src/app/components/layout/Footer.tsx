import { Link } from 'react-router';
import { BookOpen, Mail, Phone, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
                <BookOpen size={16} className="text-white" />
              </div>
              <span className="text-lg font-semibold text-white">Проф<span style={{ color: '#60A5FA' }}>База</span></span>
            </div>
            <p className="text-sm leading-relaxed">
              Информационный портал для молодых специалистов. Поддержка на каждом этапе профессионального пути.
            </p>
            <div className="flex items-center gap-2 mt-4 text-sm">
              <Mail size={14} />
              <a href="mailto:info@profbaza.by" className="hover:text-white transition-colors">info@profbaza.by</a>
            </div>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Phone size={14} />
              <span>+375 17 555-00-00</span>
            </div>
          </div>

          {/* Portal */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Портал</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['Главная', '/'],
                ['База знаний', '/knowledge'],
                ['Трудоустройство', '/employment'],
                ['Центр инцидентов', '/incidents'],
                ['Новости', '/news'],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sections */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Разделы</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['Пед. кабинет', '/ped'],
                ['Организация', '/organization'],
                ['Трудовой кодекс', '/labor-code'],
                ['Документы и шаблоны', '/ped/documents'],
              ].map(([label, path]) => (
                <li key={path}>
                  <Link to={path} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Ресурсы</h4>
            <ul className="space-y-2 text-sm">
              {[
                ['Трудовой кодекс РБ', 'https://pravo.by/document/?guid=3871&p0=hk9900296'],
                ['Кодекс об образовании РБ', 'https://pravo.by/document/?guid=3871&p0=hk1100243'],
                ['Минтруда и соцзащиты РБ', 'https://mintrud.gov.by/'],
                ['Минобразования РБ', 'https://edu.gov.by/'],
                ['Национальный правовой портал', 'https://pravo.by/'],
              ].map(([item, href]) => (
                <li key={item}>
                  <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                    <ExternalLink size={12} />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Important note */}
        <div className="border-t border-slate-800 pt-6 mb-6">
          <div className="bg-slate-800 rounded-xl px-5 py-4 text-xs leading-relaxed text-slate-400">
            <span className="font-semibold text-slate-300">Важная правовая информация: </span>
            Материалы портала носят исключительно справочный и информационный характер. Содержимое не является юридической консультацией.
            За официальным толкованием и применением норм обращайтесь к правовым актам и компетентным органам власти.
            Администрация портала не несёт ответственности за возможные неточности в материалах.
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <p>© 2026 ПрофБаза. Все права защищены.</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-white transition-colors">Политика конфиденциальности</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Пользовательское соглашение</Link>
            <Link to="/sitemap" className="hover:text-white transition-colors">Карта сайта</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
