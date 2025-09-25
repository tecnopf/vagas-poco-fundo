interface SwitcherProps {
  disabled?: boolean
  isChecked: boolean
  onChange: (val: boolean) => void
}

const Switcher1 = ({ disabled = false, isChecked, onChange }: SwitcherProps) => {
  const handleCheckboxChange = () => {
    if (!disabled) onChange(!isChecked)
  }

  return (
    <label className='flex cursor-pointer select-none items-center'>
      <div className='relative'>
        <input
          type='checkbox'
          checked={isChecked}
          onChange={handleCheckboxChange}
          disabled={disabled}
          className='sr-only'
        />
        {/* Track */}
        <div
          className={`block h-6 w-12 rounded-full transition-colors duration-300 
            ${isChecked ? 'bg-green-500' : 'bg-gray-300'}
            ${disabled && !isChecked ? 'pl-1' : 'pl-0'}
          `}
        ></div>
        {/* Dot */}
        <div
          style={{
            left: 3,
            transform: isChecked ? 'translateX(22px)' : 'translateX(0px)',
          }}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-300"
        ></div>
      </div>
    </label>
  )
}

export default Switcher1
