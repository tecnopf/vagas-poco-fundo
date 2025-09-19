import './ShinyText.css';

interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number;
  className?: string;
  hover?: boolean;
  shineColor?: string; 
}

const ShinyText: React.FC<ShinyTextProps> = ({
  text,
  disabled = false,
  speed = 5,
  className = '',
  hover = false,
  shineColor = '255, 255, 255', // default: white
}) => {
  const gradient = `linear-gradient(
    120deg,
    rgba(255,255,255,0) 40%,
    ${shineColor},
    rgba(255,255,255,0) 60%
  )`;

  return (
    <div
      className={`${hover ? 'shiny-text-hoverable' : 'shiny-text'} ${disabled ? 'disabled' : ''} ${className}`}
      data-text={text}
      style={{ '--shine-speed': `${speed}s`, '--shine-gradient': gradient } as React.CSSProperties}
    >
      {text}
    </div>
  );
};

export default ShinyText;
