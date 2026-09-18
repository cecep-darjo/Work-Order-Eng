import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Employee, Role } from '@/types';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { WorkOrders } from '@/pages/WorkOrders';
import { NewWorkOrder } from '@/pages/NewWorkOrder';
import { MyWork } from '@/pages/MyWork';
import { DailyProgressPage } from '@/pages/DailyProgressPage';
import { PendingPage } from '@/pages/PendingPage';
import { AgingPage } from '@/pages/AgingPage';
import { ReportPage } from '@/pages/ReportPage';
import { MasterDataPage } from '@/pages/MasterDataPage';
import { SettingsPage } from '@/pages/SettingsPage';

export type PageKey =
  | 'dashboard'
  | 'work-orders'
  | 'new-wo'
  | 'my-work'
  | 'daily-progress'
  | 'pending'
  | 'aging'
  | 'report'
  | 'master-data'
  | 'settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>('Admin');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState<string>('');

  const fetchEmployees = useCallback(async () => {
    const { data } = await supabase
      .from('employees')
      .select('*, department:departments(*)')
      .eq('is_active', true)
      .order('name');
    if (data) setEmployees(data as Employee[]);
  }, []);

  useEffect(() => {
    (async () => {
      await fetchEmployees();
      setLoading(false);
    })();
  }, [fetchEmployees]);

  useEffect(() => {
    if (employees.length > 0 && !currentEmployee) {
      const admin = employees.find((e) => e.role === 'Admin') || employees[0];
      setCurrentEmployee(admin);
      setCurrentRole(admin.role);
    }
  }, [employees, currentEmployee]);

  const handleRoleChange = (role: Role) => {
    setCurrentRole(role);
    const emp = employees.find((e) => e.role === role && e.is_active);
    if (emp) setCurrentEmployee(emp);
  };

  const navigate = (page: PageKey) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const handleLogin = (username: string) => {
    setLoggedInUsername(username);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUsername('');
    setCurrentPage('dashboard');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentRole={currentRole}
      />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <TopBar
          role={currentRole}
          onRoleChange={handleRoleChange}
          employees={employees}
          currentEmployee={currentEmployee}
          onEmployeeChange={setCurrentEmployee}
          onMenuClick={() => setSidebarOpen(true)}
          pageTitle={pageTitle(currentPage)}
          onLogout={handleLogout}
          loggedInUsername={loggedInUsername}
        />
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          {renderPage(currentPage, {
            currentEmployee,
            currentRole,
            employees,
            navigate,
            refreshEmployees: fetchEmployees,
          })}
        </main>
      </div>
    </div>
  );
}

function pageTitle(page: PageKey): string {
  const titles: Record<PageKey, string> = {
    'dashboard': 'Dashboard',
    'work-orders': 'Work Order',
    'new-wo': 'New Work Order',
    'my-work': 'My Work',
    'daily-progress': 'Daily Progress',
    'pending': 'Pending',
    'aging': 'Aging',
    'report': 'Report',
    'master-data': 'Master Data',
    'settings': 'Pengaturan Admin',
  };
  return titles[page];
}

interface PageProps {
  currentEmployee: Employee | null;
  currentRole: Role;
  employees: Employee[];
  navigate: (page: PageKey) => void;
  refreshEmployees: () => Promise<void>;
}

function renderPage(page: PageKey, props: PageProps) {
  switch (page) {
    case 'dashboard':
      return <Dashboard navigate={props.navigate} />;
    case 'work-orders':
      return <WorkOrders currentRole={props.currentRole} />;
    case 'new-wo':
      return (
        <NewWorkOrder
          navigate={props.navigate}
          currentEmployee={props.currentEmployee}
        />
      );
    case 'my-work':
      return (
        <MyWork
          currentEmployee={props.currentEmployee}
          currentRole={props.currentRole}
        />
      );
    case 'daily-progress':
      return <DailyProgressPage />;
    case 'pending':
      return <PendingPage />;
    case 'aging':
      return <AgingPage />;
    case 'report':
      return <ReportPage />;
    case 'master-data':
      return (
        <MasterDataPage
          employees={props.employees}
          refreshEmployees={props.refreshEmployees}
        />
      );
    case 'settings':
      return <SettingsPage navigate={props.navigate} />;
    default:
      return <Dashboard navigate={props.navigate} />;
  }
}
