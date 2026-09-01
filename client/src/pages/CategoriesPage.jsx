/**
 * @file src/pages/CategoriesPage.jsx
 * @description Multi-Category classification portal explaining specialized handling rules, displaying category breakdown stats, and providing quick filters.
 */

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchInventoryStatsThunk, selectReportsState } from '@/features/reports/reportsSlice';
import { setProductFilters } from '@/features/products/productsSlice';
import { CATEGORIES, CATEGORY_METADATA } from '@/constants/categories';
import {
  HiOutlineCube,
  HiOutlineSparkles,
  HiOutlineShieldCheck,
  HiOutlineClock,
  HiOutlineChip,
  HiOutlineExclamation,
  HiOutlineArrowRight,
  HiOutlineRefresh,
} from 'react-icons/hi';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { inventoryStats, isLoading } = useSelector(selectReportsState);

  const loadData = () => {
    dispatch(fetchInventoryStatsThunk());
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const categoryBreakdown = inventoryStats?.categoryBreakdown || [];

  const getCategoryCount = (categoryName) => {
    const found = categoryBreakdown.find(
      (c) => c.category?.toLowerCase() === categoryName.toLowerCase()
    );
    return found ? found.count : 0;
  };

  const handleCategoryFilter = (category) => {
    dispatch(setProductFilters({ category }));
    navigate('/inventory');
  };

  const CATEGORY_CARDS = [
    {
      category: CATEGORIES.FRAGILE,
      title: 'Fragile Goods & Glassware',
      subtitle: 'Cushioned Packaging & Impact Protection',
      icon: HiOutlineSparkles,
      gradient: 'from-purple-600 to-indigo-600',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      description:
        'Products requiring reinforced packaging materials (bubble wrap, air pillows, double-corrugated cartons) and strictly enforced handling instructions.',
      fields: [
        { name: 'Packaging Material', desc: 'Required packaging specification' },
        { name: 'Handling Instructions', desc: 'Stack limits & fragile orientations' },
      ],
    },
    {
      category: CATEGORIES.COLD,
      title: 'Cold Storage & Perishables',
      subtitle: 'Temperature Chain & Expiry Watch',
      icon: HiOutlineClock,
      gradient: 'from-cyan-500 to-blue-600',
      badgeColor: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      description:
        'Dairy, fresh foods, and pharmaceuticals requiring continuous temperature control (0°C - 6°C) and automated alerts for items nearing expiration within 72 hours.',
      fields: [
        { name: 'Storage Temperature', desc: 'Celsius temperature bounds' },
        { name: 'Expiry Date', desc: 'Automated 3-day countdown warnings' },
      ],
    },
    {
      category: CATEGORIES.TECH,
      title: 'Tech Hardware & Electronics',
      subtitle: 'Serial Verification & Warranty Coverage',
      icon: HiOutlineChip,
      gradient: 'from-blue-600 to-violet-600',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      description:
        'Computers, accessories, and appliances backed by manufacturer warranties, serial number tracking, and hardware customer support records.',
      fields: [
        { name: 'Warranty Period', desc: 'Duration in active months' },
        { name: 'Serial Number / Batch', desc: 'Hardware unit tracking' },
      ],
    },
    {
      category: CATEGORIES.CLEANING,
      title: 'Cleaning & Chemical Safety',
      subtitle: 'Hazard Classification & Safety Protocols',
      icon: HiOutlineExclamation,
      gradient: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      description:
        'Detergents, disinfectants, and industrial solvents requiring hazard grading (Low to Extreme) and mandatory safety handling guidelines.',
      fields: [
        { name: 'Hazard Level', desc: 'Low, Medium, High, Extreme Hazmat' },
        { name: 'Safety Instructions', desc: 'Protective gear & ventilation protocols' },
      ],
    },
    {
      category: CATEGORIES.GENERAL,
      title: 'General Merchandise',
      subtitle: 'Standard Retail Sundries',
      icon: HiOutlineCube,
      gradient: 'from-slate-700 to-slate-900',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      description:
        'Standard packaged retail dry goods without special regulatory compliance requirements.',
      fields: [
        { name: 'Standard Pricing', desc: 'Direct retail markup and tax' },
        { name: 'Reorder Threshold', desc: 'Automatic stock depletion alerts' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Multi-Category Compliance Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Standardized category extensions for specialized retail items, temperature chains, and
            safety protocols.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs sm:text-sm font-medium shadow-sm"
        >
          <HiOutlineRefresh className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Category Stats</span>
        </button>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORY_CARDS.map((card) => {
          const Icon = card.icon;
          const count = getCategoryCount(card.category);

          return (
            <div
              key={card.category}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-all duration-200 group"
            >
              <div>
                {/* Icon & Count Header */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${card.badgeColor}`}
                  >
                    {count} Active SKUs
                  </span>
                </div>

                <h3 className="font-bold text-lg text-slate-900 leading-snug">{card.title}</h3>
                <p className="text-xs font-semibold text-blue-600 mb-3">{card.subtitle}</p>

                <p className="text-xs text-slate-600 leading-relaxed mb-4">{card.description}</p>

                {/* Specific Fields List */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Extended DB Schema Attributes:
                  </span>
                  {card.fields.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100"
                    >
                      <span className="font-semibold text-slate-800">{f.name}</span>
                      <span className="text-[11px] text-slate-400">{f.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleCategoryFilter(card.category)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200 group-hover:border-blue-200"
                >
                  <span>Filter Products ({count})</span>
                  <HiOutlineArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoriesPage;
