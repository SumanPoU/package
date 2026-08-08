import * as LucideIcons from 'lucide-react';

export function renderIcon(iconName: string, className?: string) {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Smile;
  return <Icon className={className} />;
}
