/**
 * @file src/constants/categories.js
 * @description Product categories and metadata.
 * NOTE: Category keys use lowercase values to match backend ENUM definitions.
 */

export const CATEGORIES = {
  FRAGILE: 'fragile',
  COLD: 'cold',
  TECH: 'tech',
  CLEANING: 'cleaning',
  GENERAL: 'general',
};

export const ALL_CATEGORIES = Object.values(CATEGORIES);

// Display labels for UI (title case)
export const CATEGORY_LABELS = {
  fragile: 'Fragile Goods',
  cold: 'Cold & Perishable',
  tech: 'Tech & Electronics',
  cleaning: 'Cleaning & Chemicals',
  general: 'General Merchandise',
};

export const CATEGORY_METADATA = {
  fragile: {
    label: 'Fragile Goods',
    description:
      'Glassware, porcelain, and items requiring special packaging and cushioned handling.',
    iconColor: 'from-purple-500 to-indigo-600',
    specialFields: ['packagingMaterial', 'handlingInstructions'],
  },
  cold: {
    label: 'Cold & Perishable',
    description:
      'Dairy, fresh produce, and temperature-controlled items requiring cold storage tracking and expiry management.',
    iconColor: 'from-cyan-500 to-blue-600',
    specialFields: ['storageTemp', 'expiryDate'],
  },
  tech: {
    label: 'Tech & Electronics',
    description:
      'Gadgets, appliances, and electronics requiring serial number tracking and warranty coverage.',
    iconColor: 'from-blue-600 to-violet-600',
    specialFields: ['warrantyPeriodMonths', 'serialNumber'],
  },
  cleaning: {
    label: 'Cleaning & Chemicals',
    description:
      'Detergents, disinfectants, and hazardous cleaning supplies requiring safety protocols.',
    iconColor: 'from-emerald-500 to-teal-600',
    specialFields: ['hazardLevel', 'safetyInstructions'],
  },
  general: {
    label: 'General Merchandise',
    description: 'Standard packaged retail products and dry sundries.',
    iconColor: 'from-slate-600 to-slate-800',
    specialFields: [],
  },
};
