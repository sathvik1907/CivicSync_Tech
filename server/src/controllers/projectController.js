import * as projectService from '../services/projectService.js';

export async function listProjects(req, res, next) {
  try {
    const { search, city, locality, department, workType, status, delayState, page, limit } = req.query;
    const result = await projectService.getProjects({
      search,
      city,
      locality,
      department,
      workType,
      status,
      delayState,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10),
      includeDrafts: false
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function listMapProjects(req, res, next) {
  try {
    const { city } = req.query;
    const projects = await projectService.getProjectsForMap({ city });
    res.json({ projects });
  } catch (error) {
    next(error);
  }
}

export async function getProject(req, res, next) {
  try {
    const isOfficial = req.user && ['officer', 'coordinator'].includes(req.user.role);
    const project = await projectService.getProjectById(req.params.id, isOfficial);
    res.json({ project });
  } catch (error) {
    next(error);
  }
}

export async function createDraft(req, res, next) {
  try {
    const project = await projectService.createProjectDraft(req.body, req.user);
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req, res, next) {
  try {
    const expectedVersion = req.body.expectedVersion;
    delete req.body.expectedVersion;
    const project = await projectService.updateProject(req.params.id, req.body, expectedVersion, req.user);
    res.json({ project });
  } catch (error) {
    next(error);
  }
}

export async function publishProject(req, res, next) {
  try {
    const project = await projectService.publishProject(req.params.id, req.user);
    res.json({ project });
  } catch (error) {
    next(error);
  }
}

export async function addUpdate(req, res, next) {
  try {
    const update = await projectService.addProjectUpdate(req.params.id, req.body, req.user);
    res.status(201).json({ update });
  } catch (error) {
    next(error);
  }
}
