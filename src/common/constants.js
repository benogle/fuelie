export const UNITS_MIXTURE_LAMBDA = 'lambda'
export const UNITS_MIXTURE_AFR = 'afr'
export const UNITS_TEMP_C = 'c'
export const UNITS_TEMP_F = 'f'
export const UNITS_SPEED_KPH = 'kph'
export const UNITS_SPEED_MPH = 'mph'
export const UNITS_PRESSURE_KPA = 'kpa'
export const UNITS_PRESSURE_PSI = 'psi'

export const UNIT_TYPE_MIXTURE = 'mixture'
export const UNIT_TYPE_TEMPERATURE = 'temperature'
export const UNIT_TYPE_PRESSURE = 'pressure'
export const UNIT_TYPE_SPEED = 'speed'

export const CONVERTABLE_UNIT_TYPES = new Set([
  UNIT_TYPE_MIXTURE,
  UNIT_TYPE_TEMPERATURE,
  UNIT_TYPE_PRESSURE,
  UNIT_TYPE_SPEED,
])

export const PRESSURE_KPA_PER_PSI = 6.89476
export const SPEED_KPH_PER_MPH = 1.60934
export const MIXTURE_AFR_PER_LAMBDA_GAS = 14.7
