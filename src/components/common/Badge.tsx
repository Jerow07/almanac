import React from 'react';
import { Assignee, TaskCategory, Priority } from '../../types';
import { PROFILES, CATEGORIES } from '../../utils/constants';

interface BadgeProps {
  assignee?: Assignee;
  category?: TaskCategory;
  priority?: Priority;
  size?: 'sm' | 'md';
}

export const AssigneeBadge: React.FC<{ assignee: Assignee; size?: 'sm' | 'md' }> = ({
  assignee,
  size = 'sm',
}) => {
  const profile = PROFILES[assignee];
  if (!profile) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full border transition-all ${
        profile.badgeBg
      } ${profile.badgeText} ${profile.borderColor} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span>{profile.icon}</span>
      <span>{profile.shortName}</span>
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: TaskCategory; size?: 'sm' | 'md' }> = ({
  category,
  size = 'sm',
}) => {
  const cat = CATEGORIES.find((c) => c.id === category);
  if (!cat) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-full ${
        cat.badgeBg
      } ${cat.badgeText} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      }`}
    >
      <span>{cat.icon}</span>
      <span>{cat.name}</span>
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  if (priority === 'low') return null;

  if (priority === 'high') {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/60">
        🔥 Urgente
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/60">
      ⚡ Importante
    </span>
  );
};
