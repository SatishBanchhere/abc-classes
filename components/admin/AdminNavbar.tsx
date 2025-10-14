import React from 'react';
import { Menu, Bell, Search, User, Globe, Eye } from 'lucide-react';
import Link from 'next/link';

interface AdminNavbarProps {
    onMenuClick: () => void;
    title: string;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({ onMenuClick, title }) => {
    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-4">
            <div className="flex items-center justify-between">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 lg:hidden"
                    >
                        <Menu className="h-6 w-6 text-gray-600" />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                        <p className="text-sm text-gray-500">Manage your website content</p>
                    </div>
                </div>

                {/* Right side */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative hidden md:block">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* View Website */}
                    <Link href="/" target="_blank">
                        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg">
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">View Website</span>
                        </button>
                    </Link>

                    {/* Profile */}
                    <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="hidden sm:inline font-medium text-gray-700">Admin</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default AdminNavbar;