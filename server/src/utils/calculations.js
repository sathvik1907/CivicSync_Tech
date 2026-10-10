/**
 * CivicSync calculations & rules engine
 * Handles weighted milestones, delay states, budget calculations in paise,
 * and date checks with Asia/Kolkata calendar considerations.
 */

/**
 * Calculates overall weighted progress from an array of milestones.
 * Each milestone has: { weight: number, progress: number }
 * Milestone weights must sum to 100 for a valid project plan.
 */
export function calculateWeightedProgress(milestones = []) {
  if (!milestones || milestones.length === 0) return 0;
  
  const totalWeight = milestones.reduce((sum, m) => sum + (Number(m.weight) || 0), 0);
  if (totalWeight === 0) return 0;

  const weightedSum = milestones.reduce((sum, m) => {
    const w = Number(m.weight) || 0;
    const p = Math.min(100, Math.max(0, Number(m.progress) || 0));
    return sum + (w * p);
  }, 0);

  return Math.round((weightedSum / totalWeight) * 10) / 10;
}

/**
 * Calculates expected progress based on milestones due on or before evaluationDate (YYYY-MM-DD)
 */
export function calculateExpectedProgress(milestones = [], evaluationDateStr) {
  if (!milestones || milestones.length === 0) return 0;
  
  const evalDate = evaluationDateStr ? new Date(evaluationDateStr) : new Date();
  
  // Sum weights of milestones whose due date has passed
  const dueWeight = milestones.reduce((sum, m) => {
    if (!m.dueDate) return sum;
    const dueDate = new Date(m.dueDate);
    if (dueDate <= evalDate) {
      return sum + (Number(m.weight) || 0);
    }
    return sum;
  }, 0);

  return Math.min(100, Math.max(0, dueWeight));
}

/**
 * Evaluate delay and health indicators:
 * - isOverdue: applicable deadline passed and project executionState !== 'Completed'
 * - isBehindPlan: actual progress is >= 10 percentage points below expected progress
 * - isStale: no update recorded for > 14 days and executionState !== 'Completed'
 */
export function evaluateProjectHealth(project, evaluationDate = new Date()) {
  const evalDate = new Date(evaluationDate);
  const nowMs = evalDate.getTime();
  
  const isCompleted = project.executionState === 'Completed';
  const progress = calculateWeightedProgress(project.milestones);
  const expectedProgress = calculateExpectedProgress(project.milestones, evalDate.toISOString().split('T')[0]);
  
  // Applicable deadline: revisedForecastDate if set, else originalDeadline
  const effectiveDeadlineStr = project.revisedForecastDate || project.originalDeadline;
  let isOverdue = false;
  let overdueDays = 0;
  
  if (!isCompleted && effectiveDeadlineStr) {
    const deadlineDate = new Date(effectiveDeadlineStr + 'T23:59:59.999+05:30');
    if (nowMs > deadlineDate.getTime()) {
      isOverdue = true;
      overdueDays = Math.max(1, Math.floor((nowMs - deadlineDate.getTime()) / (1000 * 60 * 60 * 24)));
    }
  }

  // Behind plan: progress < expectedProgress - 10
  const isBehindPlan = !isCompleted && expectedProgress > 0 && (expectedProgress - progress >= 10);
  const behindPlanGap = isBehindPlan ? Math.round((expectedProgress - progress) * 10) / 10 : 0;

  // Stale update: > 14 days since lastUpdate
  let isStale = false;
  let daysSinceUpdate = 0;
  if (!isCompleted) {
    const lastUpdateDate = project.lastUpdatedAt ? new Date(project.lastUpdatedAt) : new Date(project.updatedAt || project.createdAt || 0);
    const msSinceUpdate = nowMs - lastUpdateDate.getTime();
    daysSinceUpdate = Math.floor(msSinceUpdate / (1000 * 60 * 60 * 24));
    if (daysSinceUpdate >= 14) {
      isStale = true;
    }
  }

  return {
    progress,
    expectedProgress,
    isOverdue,
    overdueDays,
    isBehindPlan,
    behindPlanGap,
    isStale,
    daysSinceUpdate,
    effectiveDeadline: effectiveDeadlineStr
  };
}

/**
 * Budget calculations (all amounts in paise)
 * null means unknown, 0 means zero.
 */
export function calculateBudgetMetrics(estimatedBudgetPaise, actualExpenditurePaise) {
  const hasEstimate = estimatedBudgetPaise !== null && estimatedBudgetPaise !== undefined;
  const hasExpenditure = actualExpenditurePaise !== null && actualExpenditurePaise !== undefined;

  let remainingBudgetPaise = null;
  let utilizationPercent = null;

  if (hasEstimate && hasExpenditure) {
    remainingBudgetPaise = estimatedBudgetPaise - actualExpenditurePaise;
  }

  if (hasEstimate && estimatedBudgetPaise > 0 && hasExpenditure) {
    utilizationPercent = Math.round((actualExpenditurePaise / estimatedBudgetPaise) * 1000) / 10;
  }

  return {
    hasEstimate,
    hasExpenditure,
    remainingBudgetPaise,
    utilizationPercent
  };
}

/**
 * Format paise to INR representation (₹ in Crores or Lakhs)
 */
export function formatPaiseToINR(paise) {
  if (paise === null || paise === undefined) return 'Not available';
  const rupees = paise / 100;
  if (Math.abs(rupees) >= 10000000) {
    return `₹${(rupees / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(rupees) >= 100000) {
    return `₹${(rupees / 100000).toFixed(2)} Lakh`;
  }
  return `₹${rupees.toLocaleString('en-IN')}`;
}
