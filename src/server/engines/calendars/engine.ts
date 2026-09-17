/**
 * =========================================================================================
 * UNIVERSAL WORKING CALENDARS, PUBLIC HOLIDAYS & PRORATION ENGINE
 * =========================================================================================
 * 
 * ARCHITECTURE OVERVIEW:
 * Multinational enterprises (Workday, SAP SuccessFactors, UKG) do not compute payroll
 * or leave by simple calendar day subtraction. Workforce compensation and leave quotas
 * must strictly respect regional working patterns, religious/statutory working weeks,
 * national public holidays, and mid-period employment tenure shifts.
 * 
 * Core Capabilities:
 * 1. Working Day & Hour Calculation:
 *    - Dynamically evaluates customized work weeks (e.g. Mon-Fri in Kenya/US/UK, Sun-Thu in UAE/Middle East)
 *    - Excludes observed statutory public holidays from working days
 * 2. Mid-Period Joiner / Leaver Proration Factor:
 *    - Accurately prorates monthly basic salaries based on effective hire or termination dates
 * 3. Enterprise Leave Day Deductions:
 *    - Deducts ONLY scheduled working days; exempts weekends and statutory public holidays
 * 4. Daily & Hourly Rate Computations:
 *    - Derives statutory rates for overtime multiples (1.5x, 2.0x) and unpaid leave deductions
 * =========================================================================================
 */

export type DayOfWeek = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday";

export interface WorkingCalendarConfig {
  calendarCode?: string;
  name?: string;
  workDays: DayOfWeek[];
  halfDays?: DayOfWeek[];
  dailyExpectedHours: number;
  weeklyExpectedHours: number;
}

export interface PublicHolidayItem {
  holidayDate: string; // YYYY-MM-DD
  observedDate?: string | null; // YYYY-MM-DD if shifted
  name?: string;
  isFullDay?: boolean;
  isPaid?: boolean;
}

export interface WorkingDaysBreakdown {
  totalCalendarDays: number;
  workingDays: number;
  nonWorkingDays: number;
  publicHolidayDays: number;
  scheduledWorkingHours: number;
}

export interface ProrationResult {
  prorationFactor: number; // Between 0.00 and 1.00
  totalPeriodWorkingDays: number;
  actualAttendedWorkingDays: number;
  isProrated: boolean;
  proratedBasicSalary: number;
}

export interface LeaveDeductionResult {
  totalCalendarDays: number;
  statutoryDaysDeducted: number;
  weekendsExempted: number;
  holidaysExempted: number;
}

export interface StandardWorkforceRates {
  dailyRate: number;
  hourlyRate: number;
  standardMonthlyHours: number;
  overtimeStandardRate: number; // 1.5x
  overtimeHolidayRate: number; // 2.0x
}

/**
 * Standard Global Work Calendar Presets
 */
export const STANDARD_MON_FRI_CALENDAR: WorkingCalendarConfig = {
  calendarCode: "MON_FRI_40H",
  name: "Standard Monday - Friday (40 Hours)",
  workDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
  halfDays: [],
  dailyExpectedHours: 8,
  weeklyExpectedHours: 40,
};

export const STANDARD_MON_SAT_HALF_CALENDAR: WorkingCalendarConfig = {
  calendarCode: "MON_SAT_45H",
  name: "Standard Monday - Saturday Half-Day (44 Hours)",
  workDays: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
  halfDays: ["saturday"],
  dailyExpectedHours: 8,
  weeklyExpectedHours: 44,
};

export const MIDDLE_EAST_SUN_THU_CALENDAR: WorkingCalendarConfig = {
  calendarCode: "SUN_THU_40H",
  name: "Middle East Sunday - Thursday (40 Hours)",
  workDays: ["sunday", "monday", "tuesday", "wednesday", "thursday"],
  halfDays: [],
  dailyExpectedHours: 8,
  weeklyExpectedHours: 40,
};

const DAY_NAMES: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function parseIsoDate(d: Date | string): Date {
  if (typeof d === "string") {
    const [y, m, day] = d.split("T")[0].split("-").map(Number);
    return new Date(y, m - 1, day);
  }
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 1. Computes working days and hours between two dates given a working calendar and public holidays
 */
export function calculateWorkingDays(
  startDate: Date | string,
  endDate: Date | string,
  calendar: WorkingCalendarConfig = STANDARD_MON_FRI_CALENDAR,
  holidays: PublicHolidayItem[] = []
): WorkingDaysBreakdown {
  const start = parseIsoDate(startDate);
  const end = parseIsoDate(endDate);

  if (start > end) {
    return {
      totalCalendarDays: 0,
      workingDays: 0,
      nonWorkingDays: 0,
      publicHolidayDays: 0,
      scheduledWorkingHours: 0,
    };
  }

  const holidayMap = new Set<string>();
  for (const h of holidays) {
    const effectiveHolidayDate = h.observedDate || h.holidayDate;
    if (h.isPaid !== false) {
      holidayMap.add(effectiveHolidayDate);
    }
  }

  let totalCalendarDays = 0;
  let workingDays = 0;
  let nonWorkingDays = 0;
  let publicHolidayDays = 0;
  let scheduledWorkingHours = 0;

  const current = new Date(start);
  while (current <= end) {
    totalCalendarDays++;
    const dayName = DAY_NAMES[current.getDay()];
    const dateKey = formatDateKey(current);

    const isHoliday = holidayMap.has(dateKey);
    const isWorkDay = calendar.workDays.includes(dayName);
    const isHalfDay = calendar.halfDays?.includes(dayName);

    if (!isWorkDay) {
      nonWorkingDays++;
    } else if (isHoliday) {
      publicHolidayDays++;
      // Note: Paid public holidays count towards paid tenure, but are not active physical work days
    } else {
      const dayFactor = isHalfDay ? 0.5 : 1.0;
      const dayHours = isHalfDay ? calendar.dailyExpectedHours / 2 : calendar.dailyExpectedHours;
      workingDays += dayFactor;
      scheduledWorkingHours += dayHours;
    }

    current.setDate(current.getDate() + 1);
  }

  return {
    totalCalendarDays,
    workingDays,
    nonWorkingDays,
    publicHolidayDays,
    scheduledWorkingHours,
  };
}

/**
 * 2. Computes the salary proration factor for mid-period joiners or leavers
 */
export function calculateMidPeriodProrationFactor(
  effectiveStart: Date | string | null | undefined,
  effectiveEnd: Date | string | null | undefined,
  periodStart: Date | string,
  periodEnd: Date | string,
  basicSalary: number,
  calendar: WorkingCalendarConfig = STANDARD_MON_FRI_CALENDAR,
  holidays: PublicHolidayItem[] = []
): ProrationResult {
  const pStart = parseIsoDate(periodStart);
  const pEnd = parseIsoDate(periodEnd);

  // Total working days in the full statutory payroll period (including paid public holidays)
  const fullPeriod = calculateWorkingDays(pStart, pEnd, calendar, holidays);
  const totalPeriodWorkingDays = fullPeriod.workingDays + fullPeriod.publicHolidayDays;

  if (totalPeriodWorkingDays <= 0) {
    return {
      prorationFactor: 1.0,
      totalPeriodWorkingDays: 0,
      actualAttendedWorkingDays: 0,
      isProrated: false,
      proratedBasicSalary: basicSalary,
    };
  }

  // Active employment window bounded by period start & end
  const empStart = effectiveStart ? parseIsoDate(effectiveStart) : pStart;
  const empEnd = effectiveEnd ? parseIsoDate(effectiveEnd) : pEnd;

  const activeStart = empStart > pStart ? empStart : pStart;
  const activeEnd = empEnd < pEnd ? empEnd : pEnd;

  if (activeStart > activeEnd) {
    // Employee was not active at any point during this payroll cycle
    return {
      prorationFactor: 0.0,
      totalPeriodWorkingDays,
      actualAttendedWorkingDays: 0,
      isProrated: true,
      proratedBasicSalary: 0,
    };
  }

  const activePeriod = calculateWorkingDays(activeStart, activeEnd, calendar, holidays);
  const actualAttendedWorkingDays = activePeriod.workingDays + activePeriod.publicHolidayDays;

  const isProrated = actualAttendedWorkingDays < totalPeriodWorkingDays;
  const rawFactor = actualAttendedWorkingDays / totalPeriodWorkingDays;
  const prorationFactor = Math.min(1.0, Math.round(rawFactor * 10000) / 10000);
  const proratedBasicSalary = Math.round(basicSalary * prorationFactor * 100) / 100;

  return {
    prorationFactor,
    totalPeriodWorkingDays,
    actualAttendedWorkingDays,
    isProrated,
    proratedBasicSalary,
  };
}

/**
 * 3. Computes net statutory leave days deducted from quota
 * Exempts weekends and paid public holidays falling within the leave period.
 */
export function calculateLeaveDeductionDays(
  leaveStartDate: Date | string,
  leaveEndDate: Date | string,
  calendar: WorkingCalendarConfig = STANDARD_MON_FRI_CALENDAR,
  holidays: PublicHolidayItem[] = []
): LeaveDeductionResult {
  const start = parseIsoDate(leaveStartDate);
  const end = parseIsoDate(leaveEndDate);

  if (start > end) {
    return {
      totalCalendarDays: 0,
      statutoryDaysDeducted: 0,
      weekendsExempted: 0,
      holidaysExempted: 0,
    };
  }

  const holidayMap = new Set<string>();
  for (const h of holidays) {
    const effectiveHolidayDate = h.observedDate || h.holidayDate;
    holidayMap.add(effectiveHolidayDate);
  }

  let totalCalendarDays = 0;
  let statutoryDaysDeducted = 0;
  let weekendsExempted = 0;
  let holidaysExempted = 0;

  const current = new Date(start);
  while (current <= end) {
    totalCalendarDays++;
    const dayName = DAY_NAMES[current.getDay()];
    const dateKey = formatDateKey(current);

    const isWorkDay = calendar.workDays.includes(dayName);
    const isHalfDay = calendar.halfDays?.includes(dayName);
    const isHoliday = holidayMap.has(dateKey);

    if (!isWorkDay) {
      weekendsExempted++;
    } else if (isHoliday) {
      holidaysExempted++;
    } else {
      const deduction = isHalfDay ? 0.5 : 1.0;
      statutoryDaysDeducted += deduction;
    }

    current.setDate(current.getDate() + 1);
  }

  return {
    totalCalendarDays,
    statutoryDaysDeducted,
    weekendsExempted,
    holidaysExempted,
  };
}

/**
 * 4. Derives standard workforce hourly, daily, and overtime rates
 */
export function calculateStandardRates(
  monthlyBasicSalary: number,
  calendar: WorkingCalendarConfig = STANDARD_MON_FRI_CALENDAR,
  averageWorkingDaysPerMonth: number = 21.67
): StandardWorkforceRates {
  const dailyRate = Math.round((monthlyBasicSalary / averageWorkingDaysPerMonth) * 100) / 100;
  const standardMonthlyHours = Math.round((calendar.weeklyExpectedHours * 52) / 12 * 100) / 100;
  const hourlyRate = Math.round((monthlyBasicSalary / standardMonthlyHours) * 100) / 100;

  return {
    dailyRate,
    hourlyRate,
    standardMonthlyHours,
    overtimeStandardRate: Math.round(hourlyRate * 1.5 * 100) / 100,
    overtimeHolidayRate: Math.round(hourlyRate * 2.0 * 100) / 100,
  };
}
