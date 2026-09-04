import React from 'react';
import { ZoneTelemetry } from '../../types/grid';

interface DelhiMapSVGProps {
  zones: ZoneTelemetry[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}

export const DelhiMapSVG: React.FC<DelhiMapSVGProps> = ({
  zones,
  selectedZoneId,
  onSelectZone
}) => {
  const getZoneColor = (status: string, isSelected: boolean) => {
    if (isSelected) {
      return '#2563eb'; // Selected blue outline/fill accent
    }
    switch (status.toUpperCase()) {
      case 'CRITICAL':
        return '#fee2e2'; // Light red
      case 'HIGH':
        return '#ffedd5'; // Light orange
      case 'WATCH':
        return '#fef3c7'; // Light amber
      case 'NORMAL':
      default:
        return '#ecfdf5'; // Light emerald
    }
  };

  const getZoneStroke = (status: string, isSelected: boolean) => {
    if (isSelected) return '#1d4ed8';
    switch (status.toUpperCase()) {
      case 'CRITICAL':
        return '#dc2626';
      case 'HIGH':
        return '#ea580c';
      case 'WATCH':
        return '#d97706';
      case 'NORMAL':
      default:
        return '#10b981';
    }
  };

  const zoneMap: Record<string, ZoneTelemetry | undefined> = {};
  zones.forEach(z => {
    zoneMap[z.id] = z;
  });

  return (
    <div className="relative w-full h-[480px] bg-slate-50 border border-slate-200 rounded flex items-center justify-center p-4">
      <svg
        viewBox="0 0 700 620"
        className="w-full h-full max-w-[650px] drop-shadow-xs select-none"
      >
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.75" />
          </pattern>
        </defs>

        {/* Background Grid Lines for SCADA aesthetic */}
        <rect width="700" height="620" fill="url(#grid)" />

        {/* Yamuna River Line */}
        <path
          d="M 440,20 Q 420,120 460,200 T 470,360 Q 480,480 540,600"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray="4,2"
        />
        <text x="500" y="340" fill="#60a5fa" fontSize="10" fontWeight="bold" letterSpacing="1.5">
          YAMUNA RIVER
        </text>

        {/* 1. NORTH DELHI (TPDDL: Bawana, Narela, Rohini, Civil Lines) */}
        <g
          onClick={() => onSelectZone('North')}
          className="cursor-pointer transition-all duration-200 group"
        >
          <path
            d="M 220,50 L 430,30 L 420,190 L 330,220 L 260,210 L 190,140 Z"
            fill={getZoneColor(zoneMap['North']?.status || 'NORMAL', selectedZoneId === 'North')}
            stroke={getZoneStroke(zoneMap['North']?.status || 'NORMAL', selectedZoneId === 'North')}
            strokeWidth={selectedZoneId === 'North' ? 3.5 : 1.75}
            className="group-hover:opacity-90 transition-all"
          />
          <text x="290" y="105" fill="#0f172a" fontSize="13" fontWeight="bold">NORTH DELHI</text>
          <text x="290" y="122" fill="#475569" fontSize="10" fontWeight="600">Tata Power DDL</text>
          <text x="290" y="142" fill="#0f172a" fontSize="12" fontWeight="bold" className="font-mono-num">
            {zoneMap['North']?.demand_mw} MW ({zoneMap['North']?.load_pct}%)
          </text>
          <circle cx="280" cy="138" r="4" fill={getZoneStroke(zoneMap['North']?.status || 'NORMAL', false)} />
        </g>

        {/* 2. WEST DELHI (BRPL: Punjabi Bagh, Janakpuri, Vikaspuri, Dwarka, Najafgarh) */}
        <g
          onClick={() => onSelectZone('West')}
          className="cursor-pointer transition-all duration-200 group"
        >
          <path
            d="M 190,140 L 260,210 L 260,330 L 200,440 L 90,380 L 110,240 Z"
            fill={getZoneColor(zoneMap['West']?.status || 'NORMAL', selectedZoneId === 'West')}
            stroke={getZoneStroke(zoneMap['West']?.status || 'NORMAL', selectedZoneId === 'West')}
            strokeWidth={selectedZoneId === 'West' ? 3.5 : 1.75}
            className="group-hover:opacity-90 transition-all"
          />
          <text x="160" y="270" fill="#0f172a" fontSize="13" fontWeight="bold">WEST DELHI</text>
          <text x="160" y="287" fill="#475569" fontSize="10" fontWeight="600">BSES Rajdhani (BRPL)</text>
          <text x="160" y="307" fill="#0f172a" fontSize="12" fontWeight="bold" className="font-mono-num">
            {zoneMap['West']?.demand_mw} MW ({zoneMap['West']?.load_pct}%)
          </text>
          <circle cx="150" cy="303" r="4" fill={getZoneStroke(zoneMap['West']?.status || 'NORMAL', false)} />
        </g>

        {/* 3. CENTRAL DELHI (NDMC & MES: Connaught Place, Parliament, Chanakyapuri) */}
        <g
          onClick={() => onSelectZone('Central')}
          className="cursor-pointer transition-all duration-200 group"
        >
          <path
            d="M 260,210 L 330,220 L 350,300 L 280,320 L 260,270 Z"
            fill={getZoneColor(zoneMap['Central']?.status || 'NORMAL', selectedZoneId === 'Central')}
            stroke={getZoneStroke(zoneMap['Central']?.status || 'NORMAL', selectedZoneId === 'Central')}
            strokeWidth={selectedZoneId === 'Central' ? 3.5 : 1.75}
            className="group-hover:opacity-90 transition-all"
          />
          <text x="272" y="252" fill="#0f172a" fontSize="11" fontWeight="bold">CENTRAL</text>
          <text x="272" y="266" fill="#475569" fontSize="9" fontWeight="600">NDMC / MES</text>
          <text x="272" y="282" fill="#0f172a" fontSize="10" fontWeight="bold" className="font-mono-num">
            {zoneMap['Central']?.demand_mw} MW
          </text>
        </g>

        {/* 4. EAST DELHI (BYPL: Shahdara, Laxmi Nagar, Mayur Vihar, Patparganj) */}
        <g
          onClick={() => onSelectZone('East')}
          className="cursor-pointer transition-all duration-200 group"
        >
          <path
            d="M 420,190 L 590,190 L 580,380 L 460,370 L 440,240 Z"
            fill={getZoneColor(zoneMap['East']?.status || 'WATCH', selectedZoneId === 'East')}
            stroke={getZoneStroke(zoneMap['East']?.status || 'WATCH', selectedZoneId === 'East')}
            strokeWidth={selectedZoneId === 'East' ? 3.5 : 1.75}
            className="group-hover:opacity-90 transition-all"
          />
          <text x="475" y="260" fill="#0f172a" fontSize="13" fontWeight="bold">EAST DELHI</text>
          <text x="475" y="277" fill="#475569" fontSize="10" fontWeight="600">BSES Yamuna (BYPL)</text>
          <text x="475" y="297" fill="#0f172a" fontSize="12" fontWeight="bold" className="font-mono-num">
            {zoneMap['East']?.demand_mw} MW ({zoneMap['East']?.load_pct}%)
          </text>
          <circle cx="465" cy="293" r="4" fill={getZoneStroke(zoneMap['East']?.status || 'WATCH', false)} />
        </g>

        {/* 5. SOUTH DELHI (BRPL: Hauz Khas, Saket, Nehru Place, Okhla, Sarita Vihar) */}
        <g
          onClick={() => onSelectZone('South')}
          className="cursor-pointer transition-all duration-200 group"
        >
          <path
            d="M 260,330 L 350,300 L 440,360 L 460,370 L 530,490 L 430,590 L 290,570 L 200,440 Z"
            fill={getZoneColor(zoneMap['South']?.status || 'HIGH', selectedZoneId === 'South')}
            stroke={getZoneStroke(zoneMap['South']?.status || 'HIGH', selectedZoneId === 'South')}
            strokeWidth={selectedZoneId === 'South' ? 3.5 : 1.75}
            className="group-hover:opacity-90 transition-all"
          />
          <text x="320" y="440" fill="#0f172a" fontSize="13" fontWeight="bold">SOUTH DELHI</text>
          <text x="320" y="457" fill="#475569" fontSize="10" fontWeight="600">BSES Rajdhani (BRPL)</text>
          <text x="320" y="477" fill="#0f172a" fontSize="12" fontWeight="bold" className="font-mono-num">
            {zoneMap['South']?.demand_mw} MW ({zoneMap['South']?.load_pct}%)
          </text>
          <circle cx="310" cy="473" r="4" fill={getZoneStroke(zoneMap['South']?.status || 'HIGH', false)} />
        </g>

        {/* Legend */}
        <g transform="translate(20, 530)">
          <rect width="180" height="75" fill="#ffffff" stroke="#cbd5e1" rx="4" opacity="0.95" />
          <text x="10" y="18" fontSize="10" fontWeight="bold" fill="#334155">GRID DISPATCH STATUS</text>
          
          <circle cx="16" cy="34" r="4" fill="#10b981" />
          <text x="26" y="37" fontSize="10" fill="#334155">Normal (&lt;90% Load)</text>

          <circle cx="16" cy="49" r="4" fill="#d97706" />
          <text x="26" y="52" fontSize="10" fill="#334155">Watch (90-93% Load)</text>

          <circle cx="16" cy="64" r="4" fill="#dc2626" />
          <text x="26" y="67" fontSize="10" fill="#334155">High Risk (&gt;93% Load)</text>
        </g>
      </svg>
    </div>
  );
};
