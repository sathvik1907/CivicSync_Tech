/**
 * CivicSync Explainable Coordination Detection Rules Engine
 * Implements Rules A, B, C, and D with canonical pair ordering and clear confidence labels.
 */

import { calculateDistanceMeters } from './geo.js';

/**
 * Checks if two date ranges [startA, endA] and [startB, endB] overlap inclusively.
 * Treats dates as YYYY-MM-DD strings.
 */
export function datesOverlap(startA, endA, startB, endB) {
  if (!startA || !endA || !startB || !endB) return null; // Cannot assess
  return (startA <= endB) && (endA >= startB);
}

/**
 * Calculates days difference between dateA and dateB (dateB - dateA) in days.
 */
export function getDaysDifference(dateStrA, dateStrB) {
  if (!dateStrA || !dateStrB) return null;
  const a = new Date(dateStrA);
  const b = new Date(dateStrB);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates coordination rules between two projects:
 * projectA and projectB.
 */
export function evaluateCoordinationPair(projA, projB, evaluationDate = new Date().toISOString().split('T')[0]) {
  const matches = [];

  // Determine effective date intervals for both projects
  const startA = projA.actualStartDate || projA.plannedStartDate;
  const endA = projA.actualCompletionDate || projA.revisedForecastDate || projA.originalDeadline;
  const startB = projB.actualStartDate || projB.plannedStartDate;
  const endB = projB.actualCompletionDate || projB.revisedForecastDate || projB.originalDeadline;

  const segmentsA = Array.isArray(projA.roadSegmentIds) ? projA.roadSegmentIds.map(s => String(s)) : [];
  const segmentsB = Array.isArray(projB.roadSegmentIds) ? projB.roadSegmentIds.map(s => String(s)) : [];
  const sharedSegments = segmentsA.filter(s => segmentsB.includes(s));

  // Distance between coordinates if both exist
  let distanceMeters = null;
  if (projA.location?.coordinates && projB.location?.coordinates) {
    distanceMeters = calculateDistanceMeters(projA.location.coordinates, projB.location.coordinates, true);
  }

  // RULE A: Shared Road Segment with Overlapping Dates
  if (sharedSegments.length > 0) {
    const overlap = datesOverlap(startA, endA, startB, endB);
    if (overlap === true) {
      matches.push({
        ruleId: 'RULE_A_SHARED_SEGMENT',
        ruleName: 'Shared Road Segment Conflict',
        confidence: 'Strong',
        reason: `Both projects are scheduled to occupy the same road segment (${sharedSegments.join(', ')}) during overlapping dates (${startA || '?'} to ${endA || '?'} vs ${startB || '?'} to ${endB || '?'}).`,
        sharedSegments,
        details: { startA, endA, startB, endB }
      });
    }
  }

  // RULE B: Nearby Concurrent Work (<= 200m)
  if (distanceMeters !== null && distanceMeters <= 200) {
    const overlap = datesOverlap(startA, endA, startB, endB);
    if (overlap === true) {
      matches.push({
        ruleId: 'RULE_B_NEARBY_CONCURRENT',
        ruleName: 'Nearby Concurrent Work',
        confidence: 'Potential Nearby Disruption',
        reason: `Projects are located within ${distanceMeters} metres of each other and have overlapping work periods (${startA} to ${endA} vs ${startB} to ${endB}). May cause local traffic diversion and noise clustering.`,
        distanceMeters,
        details: { distanceMeters, startA, endA, startB, endB }
      });
    }
  }

  // RULE C: Repeated Excavation (same segment, subsequent excavation starts <= 90 days after prior end)
  if (sharedSegments.length > 0) {
    const isExcavationA = projA.workType?.toLowerCase().includes('excavation') || projA.workType?.toLowerCase().includes('pipeline') || projA.workType?.toLowerCase().includes('drainage') || projA.workType?.toLowerCase().includes('cable');
    const isExcavationB = projB.workType?.toLowerCase().includes('excavation') || projB.workType?.toLowerCase().includes('pipeline') || projB.workType?.toLowerCase().includes('drainage') || projB.workType?.toLowerCase().includes('cable');

    if (isExcavationA || isExcavationB) {
      // Check A finishes before B starts
      if (endA && startB && startB >= endA) {
        const gap = getDaysDifference(endA, startB);
        if (gap !== null && gap <= 90 && gap >= 0) {
          matches.push({
            ruleId: 'RULE_C_REPEATED_EXCAVATION',
            ruleName: 'Repeated Road Excavation Warning',
            confidence: 'High Risk of Repeated Disruption',
            reason: `Project "${projB.title}" begins excavation on segment ${sharedSegments.join(', ')} only ${gap} days after project "${projA.title}" ends. Coordination recommended to synchronize road trenching before final resurfacing.`,
            gapDays: gap,
            sharedSegments
          });
        }
      }
      // Check B finishes before A starts
      if (endB && startA && startA >= endB) {
        const gap = getDaysDifference(endB, startA);
        if (gap !== null && gap <= 90 && gap >= 0) {
          matches.push({
            ruleId: 'RULE_C_REPEATED_EXCAVATION',
            ruleName: 'Repeated Road Excavation Warning',
            confidence: 'High Risk of Repeated Disruption',
            reason: `Project "${projA.title}" begins excavation on segment ${sharedSegments.join(', ')} only ${gap} days after project "${projB.title}" ends. Coordination recommended to synchronize road trenching before final resurfacing.`,
            gapDays: gap,
            sharedSegments
          });
        }
      }
    }
  }

  // RULE D: Completion Uncertainty
  // If one project is ongoing past its forecast deadline, and the other is scheduled in the same area
  const isAOverdueOngoing = projA.executionState === 'Ongoing' && endA && endA < evaluationDate;
  const isBOverdueOngoing = projB.executionState === 'Ongoing' && endB && endB < evaluationDate;

  if (isAOverdueOngoing && (sharedSegments.length > 0 || (distanceMeters !== null && distanceMeters <= 200))) {
    matches.push({
      ruleId: 'RULE_D_COMPLETION_UNCERTAINTY',
      ruleName: 'Completion Uncertainty Advisory',
      confidence: 'Advisory / Clarification Required',
      reason: `Project "${projA.title}" is currently ongoing past its forecast completion date (${endA}), while project "${projB.title}" is scheduled in the same vicinity (${sharedSegments.length > 0 ? 'shared segment' : `${distanceMeters}m away`}). Official review is required to verify actual site clearance.`,
      overdueProject: projA.projectCode
    });
  } else if (isBOverdueOngoing && (sharedSegments.length > 0 || (distanceMeters !== null && distanceMeters <= 200))) {
    matches.push({
      ruleId: 'RULE_D_COMPLETION_UNCERTAINTY',
      ruleName: 'Completion Uncertainty Advisory',
      confidence: 'Advisory / Clarification Required',
      reason: `Project "${projB.title}" is currently ongoing past its forecast completion date (${endB}), while project "${projA.title}" is scheduled in the same vicinity (${sharedSegments.length > 0 ? 'shared segment' : `${distanceMeters}m away`}). Official review is required to verify actual site clearance.`,
      overdueProject: projB.projectCode
    });
  }

  return matches;
}

/**
 * Returns canonical representation of a project pair (idA < idB)
 */
export function getCanonicalPair(idA, idB) {
  const strA = String(idA);
  const strB = String(idB);
  if (strA < strB) {
    return { firstId: strA, secondId: strB, pairKey: `${strA}::${strB}` };
  }
  return { firstId: strB, secondId: strA, pairKey: `${strB}::${strA}` };
}
