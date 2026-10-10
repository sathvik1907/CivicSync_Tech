import * as conflictService from '../services/conflictService.js';

export async function listConflicts(req, res, next) {
  try {
    const conflicts = await conflictService.detectAllConflicts();
    res.json({ conflicts });
  } catch (error) {
    next(error);
  }
}

export async function getProjectConflicts(req, res, next) {
  try {
    const conflicts = await conflictService.getConflictsForProject(req.params.id);
    res.json({ conflicts });
  } catch (error) {
    next(error);
  }
}

export async function recordDecision(req, res, next) {
  try {
    const decision = await conflictService.recordConflictDecision(req.body, req.user);
    res.status(201).json({ decision });
  } catch (error) {
    next(error);
  }
}
