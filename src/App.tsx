import React from 'react';
import { CalendarProvider, useCalendar } from './context/CalendarContext';
import { NotificationProvider } from './context/NotificationContext';
import { Header } from './components/layout/Header';
import { FilterBar } from './components/layout/FilterBar';
import { MonthView } from './components/calendar/MonthView';
import { WeekView } from './components/calendar/WeekView';
import { YearView } from './components/calendar/YearView';
import { AgendaView } from './components/calendar/AgendaView';
import { TaskModal } from './components/tasks/TaskModal';
import { CloudSyncModal } from './components/common/CloudSyncModal';
import { Footer } from './components/layout/Footer';

const CalendarContent: React.FC = () => {
  const { view, isCloudModalOpen, closeCloudModal } = useCalendar();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-slate-800 overflow-x-hidden w-full max-w-full">
      <Header />
      <FilterBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
        {view === 'month' && <MonthView />}
        {view === 'week' && <WeekView />}
        {view === 'year' && <YearView />}
        {view === 'agenda' && <AgendaView />}
      </main>

      <TaskModal />
      <CloudSyncModal isOpen={isCloudModalOpen} onClose={closeCloudModal} />
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <CalendarProvider>
      <NotificationProvider>
        <CalendarContent />
      </NotificationProvider>
    </CalendarProvider>
  );
}
