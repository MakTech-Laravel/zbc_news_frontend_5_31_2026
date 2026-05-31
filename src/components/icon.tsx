import * as React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconProps {
  iconNode?: LucideIcon;
  className?: string;
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  ({ iconNode: Icon, className, ...props }, ref) => {
    if (!Icon) return null;
    
    return <Icon ref={ref} className={className} {...props} />;
  },
);

Icon.displayName = 'Icon';

export { Icon };
