import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

type Option = {
  value: string;
  label: string;
};

type DropdownProps = {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

const Dropdown = ({ options, value, onChange, placeholder = 'Select an option', className = '', disabled = false }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div className={`custom-dropdown ${className} ${isOpen ? 'is-open' : ''} ${disabled ? 'is-disabled' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        className="dropdown-trigger"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <span className={!selectedOption ? 'placeholder-text' : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={18} className={`dropdown-chevron ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <ul className="dropdown-options">
            {options.map((option) => (
              <li
                key={option.value}
                className={`dropdown-option ${option.value === value ? 'is-selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                <span>{option.label}</span>
                {option.value === value && <Check size={16} className="selected-icon" />}
              </li>
            ))}
            {options.length === 0 && (
              <li className="dropdown-option no-results">No options available</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dropdown;
