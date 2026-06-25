import { RecordCategory } from '../../types';

interface CategoryBadgeProps {
  category: RecordCategory;
}

const categoryColors: Record<RecordCategory, string> = {
  'Prescription': 'bg-[#EFF6FF] text-[#1D4ED8]',
  'Lab Report': 'bg-[#F5F3FF] text-[#6D28D9]',
  'Scan': 'bg-[#EEF2FF] text-[#4338CA]',
  'Vaccination': 'bg-[#ECFDF5] text-[#065F46]',
  'Discharge Summary': 'bg-[#FFFBEB] text-[#92400E]',
  'Other': 'bg-[#F9FAFB] text-[#374151]',
};

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-badge text-xs font-medium ${categoryColors[category]}`}>
      {category}
    </span>
  );
};
