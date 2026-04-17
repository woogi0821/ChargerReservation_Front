import { useState } from "react";

// 💡 타입 정의 (가이드라인 준수) [cite: 18, 35]
export interface SelectOption {
    label: string;
    value: string;
}

interface CustomSelectProps {
    options: SelectOption[];
    value?: string;
    placeholder?: string;
    onChange: (value: string) => void;
}

const selectStyles = {
    container: "relative w-full",
    trigger: "w-full flex items-center justify-between bg-zinc-800 text-white px-4 py-3 rounded-lg border border-zinc-700 hover:border-green-500 transition-colors",
    placeholder: "text-zinc-400",
    selectedValue: "text-white",
    icon: "transform transition-transform duration-200",
    listContainer: "absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl max-h-60 overflow-y-auto",
    listItem: "px-4 py-3 cursor-pointer transition-colors hover:bg-green-600 hover:text-white",
    activeItem: "bg-green-500 text-white font-bold",
    inactiveItem: "text-zinc-200"
};

export const CustomSelect = ({
    options,
    value,
    placeholder = "선택해주세요",
    onChange
}: CustomSelectProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const selectedLabel = options.find((opt) => opt.value === value)?.label;

    const handleToggle = () => setIsOpen(!isOpen);
    const handleSelect = (selectedValue: string) => {
        onChange(selectedValue);
        setIsOpen(false);
    };

    return (
        <div className={selectStyles.container}>
            <button type="button" onClick={handleToggle} className={selectStyles.trigger}>
                <span className={selectedLabel ? selectStyles.selectedValue : selectStyles.placeholder}>
                    {selectedLabel || placeholder}
                </span>
                <span className={`${selectStyles.icon} ${isOpen ? "rotate-180" : ""}`}>▼</span>
            </button>

            {isOpen && (
                <ul className={selectStyles.listContainer}>
                    {options.map((option) => (
                        <li
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className={`${selectStyles.listItem} ${
                                option.value === value ? selectStyles.activeItem : selectStyles.inactiveItem
                            }`}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};