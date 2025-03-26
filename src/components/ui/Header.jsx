import React from 'react';

const Header = ({ title, subtitle }) => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-6 px-8">
      <h1 className="text-3xl font-bold text-white">{title}</h1>
      {subtitle && <p className="text-blue-100 mt-2">{subtitle}</p>}
    </div>
  );
};

export default Header;
