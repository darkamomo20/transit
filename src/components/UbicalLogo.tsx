import React, { useState } from 'react';

interface UbicalLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const UbicalLogo: React.FC<UbicalLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const titleSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base sm:text-lg',
    lg: 'text-xl sm:text-2xl',
    xl: 'text-2xl sm:text-3xl',
  };

  const subtitleSizes = {
    xs: 'text-[7px]',
    sm: 'text-[8px]',
    md: 'text-[9px] sm:text-[10px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* CIRCULAR LOGO BADGE */}
      <div className={`relative shrink-0 ${sizeClasses[size]}`}>
        {!imgError ? (
          <img
            src="/ubical_logo.png"
            alt="UBICAL - Localización de Transporte Público"
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full rounded-full border-2 border-cyan-400/80 shadow-lg object-cover bg-white"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-900 via-cyan-600 to-teal-400 p-0.5 shadow-lg flex items-center justify-center border-2 border-cyan-300">
            <div className="w-full h-full rounded-full bg-[#0A1128] flex items-center justify-center">
              <span className="font-black text-cyan-400 text-xs">UB</span>
            </div>
          </div>
        )}
        <div
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse shadow-sm"
          title="GPS y Red en directo activa"
        />
      </div>

      {/* BRAND TEXT: UBICAL - Localización de Transporte Público */}
      {showText && (
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <h1 className={`font-black tracking-tight text-white leading-tight uppercase font-sans ${titleSizes[size]}`}>
              <span className="text-cyan-400">UBI</span>
              <span className="text-blue-500">CAL</span>
            </h1>
            <span className="text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded uppercase">
              GPS LIVE
            </span>
          </div>
          <p className={`font-mono text-slate-300 truncate tracking-tight ${subtitleSizes[size]}`}>
            Localización de Transporte Público
          </p>
        </div>
      )}
    </div>
  );
};
