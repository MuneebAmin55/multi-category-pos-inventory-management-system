/**
 * @file src/constants/categories.js
 * @description Product categories and metadata.
 */

export const CATEGORIES = {
  FRAGILE: 'Fragile',
  COLD: 'Cold',
  TECH: 'Tech',
  CLEANING: 'Cleaning',
  GENERAL: 'General',
};

export const ALL_CATEGORIES = Object.values(CATEGORIES);

export const CATEGORY_METADATA = {
  [CATEGORIES.FRAGILE]: {
    label: 'Fragile Goods',
    description:
      'Glassware, porcelain, and items requiring special packaging and cushioned handling.',
    iconColor: 'from-purple-500 to-indigo-600',
    specialFields: ['packagingMaterial', 'handlingInstructions'],
  },
  [CATEGORIES.COLD]: {
    label: 'Cold & Perishable',
    description:
      'Dairy, fresh produce, and temperature-controlled items requiring cold storage tracking and expiry management.',
    iconColor: 'from-cyan-500 to-blue-600',
    specialFields: ['storageTemp', 'expiryDate'],
  },
  [CATEGORIES.TECH]: {
    label: 'Tech & Electronics',
    description:
      'Gadgets, appliances, and electronics requiring serial number tracking and warranty coverage.',
    iconColor: 'from-blue-600 to-violet-600',
    specialFields: ['warrantyPeriodMonths', 'serialNumber'],
  },
  [CATEGORIES.CLEANING]: {
    label: 'Cleaning & Chemicals',
    description:
      'Detergents, disinfectants, and hazardous cleaning supplies requiring safety protocols.',
    iconColor: 'from-emerald-500 to-teal-600',
    specialFields: ['hazardLevel', 'safetyInstructions'],
  },
  [CATEGORIES.GENERAL]: {
    label: 'General Merchandise',
    description: 'Standard packaged retail products and dry sundries.',
    iconColor: 'from-slate-600 to-slate-800',
    specialFields: [],
  },
};
