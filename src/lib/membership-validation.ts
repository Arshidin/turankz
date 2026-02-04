import { z } from 'zod';

const kazakhstanPhoneRegex = /^\+7\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/;
const iinRegex = /^\d{12}$/;

export const REGIONS = [
  'akmolinskaya',
  'aktobe',
  'almaty_region',
  'atyrau',
  'east_kazakhstan',
  'zhambyl',
  'west_kazakhstan',
  'karaganda',
  'kostanay',
  'kyzylorda',
  'mangystau',
  'pavlodar',
  'north_kazakhstan',
  'turkestan',
  'ulytau',
  'abay',
  'zhetysu',
] as const;

export const LIVESTOCK_TYPES = ['cattle', 'sheep', 'horses'] as const;

export const EXPERIENCE_OPTIONS = ['<1', '1-3', '3-5', '5-10', '>10'] as const;

export const SOURCE_OPTIONS = [
  'referral',
  'social',
  'search',
  'government',
  'media',
  'other',
] as const;

export const membershipApplicationSchema = z.object({
  // Персональные данные
  full_name: z.string()
    .min(2, 'validation.full_name_min')
    .max(100, 'validation.full_name_max'),
  iin: z.string()
    .regex(iinRegex, 'validation.iin_format'),
  phone: z.string()
    .regex(kazakhstanPhoneRegex, 'validation.phone_format'),
  email: z.string()
    .email('validation.email_format')
    .optional()
    .or(z.literal('')),

  // Данные о хозяйстве
  farm_name: z.string().max(200).optional().or(z.literal('')),
  region: z.enum(REGIONS, {
    required_error: 'validation.region_required',
  }),
  district: z.string().min(2, 'validation.district_min'),
  settlement: z.string().min(2, 'validation.settlement_min'),

  // Информация о скоте
  livestock_types: z.array(z.enum(LIVESTOCK_TYPES))
    .min(1, 'validation.livestock_types_min'),
  herd_size_cattle: z.number().min(0).optional().default(0),
  herd_size_sheep: z.number().min(0).optional().default(0),
  herd_size_horses: z.number().min(0).optional().default(0),
  experience_years: z.enum(EXPERIENCE_OPTIONS, {
    required_error: 'validation.experience_required',
  }),

  // Дополнительно
  how_did_you_hear: z.enum(SOURCE_OPTIONS).optional(),
  comments: z.string().max(500).optional().or(z.literal('')),

  // Согласия
  terms_accepted: z.literal(true, {
    errorMap: () => ({ message: 'validation.terms_required' }),
  }),
  data_processing_accepted: z.literal(true, {
    errorMap: () => ({ message: 'validation.data_processing_required' }),
  }),
}).refine((data) => {
  // Проверка что хотя бы одно поголовье > 0
  const hasLivestock =
    (data.livestock_types.includes('cattle') && (data.herd_size_cattle || 0) > 0) ||
    (data.livestock_types.includes('sheep') && (data.herd_size_sheep || 0) > 0) ||
    (data.livestock_types.includes('horses') && (data.herd_size_horses || 0) > 0);
  return hasLivestock;
}, {
  message: 'validation.herd_size_required',
  path: ['livestock_types'],
});

export type MembershipApplicationData = z.infer<typeof membershipApplicationSchema>;

// Тип для отправки в БД (без согласий)
export type MembershipApplicationPayload = Omit<
  MembershipApplicationData,
  'terms_accepted' | 'data_processing_accepted'
>;
