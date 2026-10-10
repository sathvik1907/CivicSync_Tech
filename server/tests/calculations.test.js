import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateWeightedProgress,
  calculateExpectedProgress,
  evaluateProjectHealth,
  calculateBudgetMetrics,
  formatPaiseToINR
} from '../src/utils/calculations.js';

describe('Calculations Utility Tests', () => {
  test('calculateWeightedProgress: handles valid weights summing to 100', () => {
    const milestones = [
      { weight: 25, progress: 100 },
      { weight: 35, progress: 50 },
      { weight: 40, progress: 0 }
    ];
    // 25*100 + 35*50 + 40*0 = 2500 + 1750 = 4250 / 100 = 42.5
    const progress = calculateWeightedProgress(milestones);
    assert.equal(progress, 42.5);
  });

  test('calculateWeightedProgress: handles empty or zero milestones', () => {
    assert.equal(calculateWeightedProgress([]), 0);
    assert.equal(calculateWeightedProgress(null), 0);
  });

  test('calculateExpectedProgress: sums weights of milestones whose due date has passed', () => {
    const milestones = [
      { weight: 30, dueDate: '2026-09-01' },
      { weight: 40, dueDate: '2026-10-01' },
      { weight: 30, dueDate: '2026-11-01' }
    ];
    const expected = calculateExpectedProgress(milestones, '2026-10-05');
    assert.equal(expected, 70); // 30 + 40
  });

  test('evaluateProjectHealth: detects overdue project when deadline has passed', () => {
    const project = {
      executionState: 'Ongoing',
      originalDeadline: '2026-09-01',
      revisedForecastDate: null,
      milestones: [{ weight: 100, progress: 50, dueDate: '2026-09-01' }],
      lastUpdatedAt: new Date('2026-10-01')
    };
    const health = evaluateProjectHealth(project, new Date('2026-10-10'));
    assert.equal(health.isOverdue, true);
    assert.ok(health.overdueDays >= 35);
  });

  test('evaluateProjectHealth: detects behind plan when actual progress is >= 10 points below expected', () => {
    const project = {
      executionState: 'Ongoing',
      originalDeadline: '2026-12-01',
      milestones: [
        { weight: 50, progress: 100, dueDate: '2026-09-01' },
        { weight: 30, progress: 0, dueDate: '2026-10-01' }, // expected = 80
        { weight: 20, progress: 0, dueDate: '2026-12-01' }
      ],
      lastUpdatedAt: new Date('2026-10-05')
    };
    // Expected progress: 80, Actual progress: 50. Gap = 30 >= 10
    const health = evaluateProjectHealth(project, new Date('2026-10-05'));
    assert.equal(health.isBehindPlan, true);
    assert.equal(health.behindPlanGap, 30);
  });

  test('evaluateProjectHealth: detects stale update when no update for > 14 days', () => {
    const project = {
      executionState: 'Ongoing',
      originalDeadline: '2026-12-01',
      milestones: [{ weight: 100, progress: 20, dueDate: '2026-12-01' }],
      lastUpdatedAt: new Date('2026-09-01') // 39 days ago from 2026-10-10
    };
    const health = evaluateProjectHealth(project, new Date('2026-10-10'));
    assert.equal(health.isStale, true);
    assert.ok(health.daysSinceUpdate >= 14);
  });

  test('calculateBudgetMetrics: correctly computes remaining and utilization percentage', () => {
    // 5 Cr estimated, 3 Cr actual
    const estimatedPaise = 5000000000;
    const actualPaise = 3000000000;
    const metrics = calculateBudgetMetrics(estimatedPaise, actualPaise);

    assert.equal(metrics.hasEstimate, true);
    assert.equal(metrics.hasExpenditure, true);
    assert.equal(metrics.remainingBudgetPaise, 2000000000);
    assert.equal(metrics.utilizationPercent, 60.0);
  });

  test('calculateBudgetMetrics: supports negative remaining budget and >100% utilization', () => {
    const estimatedPaise = 2000000000; // 2 Cr
    const actualPaise = 2500000000; // 2.5 Cr (over-budget)
    const metrics = calculateBudgetMetrics(estimatedPaise, actualPaise);

    assert.equal(metrics.remainingBudgetPaise, -500000000);
    assert.equal(metrics.utilizationPercent, 125.0);
  });

  test('calculateBudgetMetrics: handles null / unknown budget values', () => {
    const metrics = calculateBudgetMetrics(null, null);
    assert.equal(metrics.hasEstimate, false);
    assert.equal(metrics.hasExpenditure, false);
    assert.equal(metrics.remainingBudgetPaise, null);
    assert.equal(metrics.utilizationPercent, null);
  });

  test('formatPaiseToINR: formats Crores and Lakhs cleanly', () => {
    assert.equal(formatPaiseToINR(null), 'Not available');
    assert.equal(formatPaiseToINR(3800000000), '₹3.80 Cr');
    assert.equal(formatPaiseToINR(45000000), '₹4.50 Lakh');
    assert.equal(formatPaiseToINR(500000), '₹5,000');
  });
});
