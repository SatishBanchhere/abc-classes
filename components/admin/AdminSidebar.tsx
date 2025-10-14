import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
    Home,
    Settings,
    Users,
    FileText,
    Phone,
    Award,
    BookOpen,
    GraduationCap,
    Image,
    Star,
    LogOut,
    ChevronRight,
    Layout,
    Globe,
    Megaphone,
    FilePlus, PencilLine, Video
} from 'lucide-react';

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: any
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose, onLogout }) => {
    const router = useRouter();
    const pathname = usePathname();

    const menuItems = [
        { href: '/admin', icon: Layout, label: 'Dashboard' },
        { href: '/admin/homepage', icon: Home, label: 'Homepage' },
        { href: '/admin/question-upload', icon: FilePlus, label: 'Question Upload' },
        { href: '/admin/create-test', icon: PencilLine, label: 'Create Test' },
        { href: '/admin/students', icon: Users, label: 'Student Verification' },
        { href: '/admin/question-stats', icon: Award, label: 'Question Statistics' },
        { href: '/admin/managetests', icon: FileText, label: 'Manage Tests' },
        { href: '/admin/media', icon: Video, label: 'Manage Media & Interviews' },
        { href: '/admin/hero-section', icon: Globe, label: 'Hero Section' },
        { href: '/admin/jee', icon: BookOpen, label: 'JEE Page' },
        { href: '/admin/neet', icon: GraduationCap, label: 'NEET Page' },
        { href: '/admin/results', icon: Users, label: 'Results Page' },
        { href: '/admin/contact', icon: Phone, label: 'Contact Page' },
        { href: '/admin/gallery', icon: Image, label: 'Gallery' },
        { href: '/admin/features', icon: Settings, label: 'Features' },
        { href: '/admin/testimonials', icon: Star, label: 'Testimonials' },
        { href: '/admin/youtube-videos', icon: FileText, label: 'YouTube Videos' },
        { href: '/admin/advertisement', icon: Megaphone, label: 'Advertisement' },
        { href: '/admin/stats', icon: Award, label: 'Statistics' },
        { href: '/admin/site-settings', icon: Settings, label: 'Site Settings' },
    ];

    const handleLogout = () => {
        // Add logout logic here
        onLogout();
        // localStorage.removeItem('adminToken');
        // router.push('/admin/login');
    };

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed left-0 top-0 h-full w-64 bg-white/80 backdrop-blur-md border-r border-gray-200/50 
        transform transition-transform duration-300 ease-in-out z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-6 border-b border-gray-200/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Settings className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                                <p className="text-sm text-gray-500">KK Mishra Classes</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;

                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className={`
                    flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                                        : 'text-gray-700 hover:bg-gray-100/80 hover:text-gray-900'
                                    }
                  `}>
                                        <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-700'}`} />
                                        <span className="font-medium">{item.label}</span>
                                        {isActive && <ChevronRight className="h-4 w-4 ml-auto" />}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout Button */}
                    <div className="p-4 border-t border-gray-200/50">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AdminSidebar;