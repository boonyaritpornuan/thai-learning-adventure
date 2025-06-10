
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-sky-600 text-white p-4 shadow-lg sticky top-0 z-50">
      <nav className="container mx-auto flex flex-wrap justify-between items-center">
        <Link to="/" className="text-xl sm:text-2xl md:text-3xl font-bold hover:text-yellow-300 transition-colors flex items-center">
          <i className="fas fa-rocket mr-2 transform rotate-[-15deg]"></i>
          <span>Thai Learning Adventure</span>
        </Link>
        <div className="space-x-3 sm:space-x-4 mt-2 sm:mt-0">
          <Link to="/" className="text-base sm:text-lg hover:text-yellow-300 transition-colors p-1 sm:p-2 rounded-md hover:bg-sky-700">
            <i className="fas fa-home mr-1 sm:mr-2"></i><span className="hidden sm:inline">หน้าหลัก</span>
            <span className="sm:hidden">บ้าน</span>
          </Link>
          <Link to="/profile" className="text-base sm:text-lg hover:text-yellow-300 transition-colors p-1 sm:p-2 rounded-md hover:bg-sky-700">
            <i className="fas fa-user mr-1 sm:mr-2"></i><span className="hidden sm:inline">โปรไฟล์</span>
            <span className="sm:hidden">ฉัน</span>
          </Link>
        </div>
      </nav>
    </header>
  );
};

export default Header;