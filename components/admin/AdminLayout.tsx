"use client"
import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

interface AdminLayoutProps {
    children: React.ReactNode;
    title: string;
    onLogout: () => Promise<void> | void
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title, onLogout }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/10">
            <AdminSidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onLogout={onLogout}
            />

            <div className="lg:ml-64">
                <AdminNavbar
                    onMenuClick={() => setSidebarOpen(true)}
                    title={title}
                />

                <main className="p-6">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;