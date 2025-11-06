import React from "react";
const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] w-full py-10">
      <div className="relative w-12 h-12 mb-4">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-orange-200 rounded-full"></div>
        {/* Rotating arc */}
        <div className="absolute inset-0 border-4 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
      <p className="text-orange-600 font-semibold text-sm">{text}</p>
    </div>
  );
};

export default Loader;
