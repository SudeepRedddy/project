import React, { useState, useRef, useEffect } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';

interface ComboboxItem {
  value: string;
  label: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const Combobox = ({ items, value, onChange, placeholder }: ComboboxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside of the component to close the dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);
  
  // When the selected value changes from the parent, update the input text
  useEffect(() => {
    const selectedItem = items.find(item => item.value === value);
    setInputValue(selectedItem ? selectedItem.label : '');
  }, [value, items]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen) {
      setIsOpen(true);
    }
  };
  
  const handleSelect = (item: ComboboxItem) => {
    onChange(item.value);
    setInputValue(item.label);
    setIsOpen(false);
  };

  const filteredItems = inputValue
    ? items.filter(item =>
        item.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    : items;

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full pl-4 pr-10 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all duration-200"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronsUpDown className="h-5 w-5" />
        </button>
      </div>
      
      {isOpen && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <li
                key={item.value}
                className="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900 hover:bg-blue-100"
                onClick={() => handleSelect(item)}
              >
                <span className={`block truncate ${item.value === value ? 'font-medium' : 'font-normal'}`}>
                  {item.label}
                </span>
                {item.value === value ? (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                    <Check className="h-5 w-5" />
                  </span>
                ) : null}
              </li>
            ))
          ) : (
            <li className="relative cursor-default select-none py-2 px-4 text-gray-700">
              No results found.
            </li>
          )}
        </ul>
      )}
    </div>
  );
};