import crypto from 'crypto';
import { Project } from '../models/Project.js';
import { ConflictDecision } from '../models/ConflictDecision.js';
import { ActivityEvent } from '../models/ActivityEvent.js';
import { evaluateCoordinationPair, getCanonicalPair } from '../utils/coordinationRules.js';

function computeFingerprint(projA, projB) {
  const content = [
    projA.plannedStartDate,
    projA.revisedForecastDate || projA.originalDeadline,
    projA.actualStartDate,
    projA.actualCompletionDate,
    (projA.roadSegmentIds || []).sort().join(','),
    projB.plannedStartDate,
    projB.revisedForecastDate || projB.originalDeadline,
    projB.actualStartDate,
    projB.actualCompletionDate,
    (projB.roadSegmentIds || []).sort().join(',')
  ].join('|');
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

export async function detectAllConflicts() {
  const projects = await Project.find({ publicationState: 'Published' })
    .populate('department', 'code name city')
    .sort({ createdAt: -1 });

  const pairCandidates = new Map();

  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const projA = projects[i];
      const projB = projects[j];

      const matches = evaluateCoordinationPair(projA, projB);
      if (matches.length > 0) {
        const canonical = getCanonicalPair(projA._id, projB._id);
        const fingerprint = computeFingerprint(projA, projB);

        // Fetch existing decision for this canonical pair
        const decision = await ConflictDecision.findOne({
          pairKey: canonical.pairKey,
          inputFingerprint: fingerprint
        }).populate('decidedBy', 'displayName role');

        pairCandidates.set(canonical.pairKey, {
          pairKey: canonical.pairKey,
          projectA: {
            id: projA._id,
            projectCode: projA.projectCode,
            title: projA.title,
            city: projA.city,
            locality: projA.locality,
            department: projA.department,
            plannedStartDate: projA.plannedStartDate,
            originalDeadline: projA.originalDeadline,
            revisedForecastDate: projA.revisedForecastDate,
            roadSegmentIds: projA.roadSegmentIds,
            executionState: projA.executionState
          },
          projectB: {
            id: projB._id,
            projectCode: projB.projectCode,
            title: projB.title,
            city: projB.city,
            locality: projB.locality,
            department: projB.department,
            plannedStartDate: projB.plannedStartDate,
            originalDeadline: projB.originalDeadline,
            revisedForecastDate: projB.revisedForecastDate,
            roadSegmentIds: projB.roadSegmentIds,
            executionState: projB.executionState
          },
          matches,
          fingerprint,
          decision: decision ? {
            decision: decision.decision,
            explanation: decision.explanation,
            decidedBy: decision.decidedBy?.displayName || 'Authorized Official',
            decidedAt: decision.decidedAt
          } : null,
          status: decision ? decision.decision : 'Open'
        });
      }
    }
  }

  return Array.from(pairCandidates.values());
}

export async function getConflictsForProject(projectId) {
  const allConflicts = await detectAllConflicts();
  const idStr = String(projectId);
  return allConflicts.filter(c => String(c.projectA.id) === idStr || String(c.projectB.id) === idStr);
}

export async function recordConflictDecision({ projectAId, projectBId, ruleId, decision, explanation }, user) {
  if (!decision || !explanation || explanation.trim().length === 0) {
    const error = new Error('Decision and an explanation rationale are required.');
    error.statusCode = 400;
    throw error;
  }

  const projA = await Project.findById(projectAId);
  const projB = await Project.findById(projectBId);

  if (!projA || !projB) {
    const error = new Error('One or both projects could not be found.');
    error.statusCode = 404;
    throw error;
  }

  const canonical = getCanonicalPair(projA._id, projB._id);
  const fingerprint = computeFingerprint(projA, projB);

  const conflictDecision = await ConflictDecision.findOneAndUpdate(
    { pairKey: canonical.pairKey, inputFingerprint: fingerprint },
    {
      pairKey: canonical.pairKey,
      projectA: projA._id,
      projectB: projB._id,
      ruleId: ruleId || 'COORDINATION_RULE',
      inputFingerprint: fingerprint,
      decision,
      explanation: explanation.trim(),
      decidedBy: user._id,
      decidedAt: new Date()
    },
    { upsert: true, new: true }
  );

  await ActivityEvent.create({
    entityType: 'ConflictDecision',
    entityId: conflictDecision._id,
    actor: user._id,
    event: 'CONFLICT_DECISION_RECORDED',
    details: { pairKey: canonical.pairKey, decision }
  });

  return conflictDecision;
}
