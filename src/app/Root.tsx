import { useState } from 'react';
import { Outlet } from 'react-router';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

export default function Root() {
  const [tabletNavExpanded, setTabletNavExpanded] = useState(true);

  return (
    <div
      className="min-h-screen flex flex-col pb-24 md:pb-0"
      style={{ background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}
    >
      <Header
        tabletNavExpanded={tabletNavExpanded}
        onTabletNavToggle={() => setTabletNavExpanded((value) => !value)}
      />
      <main
        className={`flex-1 transition-[padding] duration-200 ${
          tabletNavExpanded ? 'md:pl-72 xl:pl-0' : 'md:pl-20 xl:pl-0'
        }`}
      >
        <Outlet />
      </main>
      <div
        className={`transition-[padding] duration-200 ${
          tabletNavExpanded ? 'md:pl-72 xl:pl-0' : 'md:pl-20 xl:pl-0'
        }`}
      >
        <Footer />
      </div>
    </div>
  );
}
