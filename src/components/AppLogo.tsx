import logoImage from 'figma:asset/f363da58c695d80309a491d46687c31d09664423.png';

type AppLogoProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

export function AppLogo({ size = 'md', className = '' }: AppLogoProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <img 
      src={logoImage} 
      alt="Gualán Market Logo" 
      className={`${sizeClasses[size]} object-contain ${className}`}
    />
  );
}
