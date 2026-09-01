/**
 * @file src/components/common/SearchInput.jsx
 * @description Search box with search icon and clear button.
 */

import { HiOutlineSearch, HiOutlineX } from 'react-icons/hi';

const SearchInput = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search records...',
  className = '',
}) => {
  return (
    <div className={`relative flex-1 min-w-[200px] ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <HiOutlineSearch className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-white border border-slate-200/90 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
      />
      {value && (
        <button
          onClick={onClear}
          aria-label="Clear search"
          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
        >
          <HiOutlineX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;
