import React from 'react';

const CustomButton = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = "relative inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 focus:ring-violet-500",
    secondary: "bg-white/10 text-white hover:bg-white/20 focus:ring-white",
    ghost: "bg-transparent hover:bg-white/5 text-white focus:ring-white"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="relative">
        {children}
      </span>
    </button>
  );
};

export default CustomButton;