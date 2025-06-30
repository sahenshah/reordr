import Button from '@mui/material/Button';
import type { ReactNode } from 'react';

interface BasicButtonsProps {
  children: ReactNode;
  variant?: 'contained' | 'outlined' | 'text';
  onClick?: () => void;
  disabled?: boolean;
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  size?: 'small' | 'medium' | 'large';
}

function BasicButtons({ 
  children, 
  variant = 'contained', 
  onClick, 
  disabled = false,
  color = 'primary',
  size = 'medium'
}: BasicButtonsProps) {
  return (
    <Button 
      variant={variant} 
      onClick={onClick}
      disabled={disabled}
      color={color}
      size={size}
    >
      {children}
    </Button>
  );
}

export default BasicButtons;