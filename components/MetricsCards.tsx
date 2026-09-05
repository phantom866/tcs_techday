'use client';

import React from 'react';
import { ShieldAlert, User, Mail, Phone, CreditCard, MapPin, Zap } from 'lucide-react';
import { ScanResult } from '@/types';

interface MetricsCardsProps {
  result: ScanResult | null;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ result }) => {
  const stats = result?.stats || {
    total: 0,
    byType: {
      NAME: 0,
      EMAIL: 0,
      PHONE: 0,
      ID_NUMBER: 0,
      LOCATION: 0,
    },
    processingTimeMs: 0,
    characterCount: 0,
  };

  const cards = [
    {
      label: 'Total Detections',
      value: stats.total,
      icon: ShieldAlert,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      badge: result ? `${stats.total} found` : 'Idle',
    },
    {
      label: 'Names',
      value: stats.byType.NAME,
      icon: User,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      badge: 'NAME',
    },
    {
      label: 'Emails',
      value: stats.byType.EMAIL,
      icon: Mail,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      badge: 'EMAIL',
    },
    {
      label: 'Phone Numbers',
      value: stats.byType.PHONE,
      icon: Phone,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      badge: 'PHONE',
    },
    {
      label: 'ID Numbers',
      value: stats.byType.ID_NUMBER,
      icon: CreditCard,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      badge: 'ID_NUMBER',
    },
    {
      label: 'Locations',
      value: stats.byType.LOCATION,
      icon: MapPin,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      badge: 'LOCATION',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map(card => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className={`p-3.5 rounded-xl border ${card.bgColor} bg-slate-900/60 backdrop-blur-sm transition-all hover:translate-y-[-1px]`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-slate-400 truncate">{card.label}</span>
              <Icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold tracking-tight text-white">
                {card.value}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-slate-800 text-slate-400">
                {card.badge}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
