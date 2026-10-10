import { Project } from '../models/Project.js';
import { ProjectUpdate } from '../models/ProjectUpdate.js';
import { ActivityEvent } from '../models/ActivityEvent.js';
import { evaluateProjectHealth, calculateBudgetMetrics } from '../utils/calculations.js';

export async function getProjects({
  search,
  city,
  locality,
  department,
  workType,
  status,
  delayState,
  page = 1,
  limit = 20,
  includeDrafts = false,
  userDepartment = null
}) {
  const query = {};

  if (!includeDrafts) {
    query.publicationState = 'Published';
  } else if (userDepartment) {
    query.department = userDepartment;
  }

  if (city) {
    query.city = new RegExp(`^${city}$`, 'i');
  }

  if (locality) {
    query.locality = new RegExp(`^${locality}$`, 'i');
  }

  if (department) {
    query.department = department;
  }

  if (workType) {
    query.workType = workType;
  }

  if (status) {
    query.executionState = status;
  }

  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [
      { title: new RegExp(escaped, 'i') },
      { projectCode: new RegExp(escaped, 'i') },
      { locality: new RegExp(escaped, 'i') },
      { description: new RegExp(escaped, 'i') },
      { roadSegmentIds: new RegExp(escaped, 'i') }
    ];
  }

  const skip = (Math.max(1, page) - 1) * limit;
  const total = await Project.countDocuments(query);

  const rawProjects = await Project.find(query)
    .populate('department', 'code name city')
    .populate('contractor', 'name registrationNumber')
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  // Compute live health and budget metrics for each project
  let projects = rawProjects.map(p => {
    const pObj = p.toObject();
    const health = evaluateProjectHealth(pObj);
    const budget = calculateBudgetMetrics(pObj.estimatedBudgetPaise, pObj.actualExpenditurePaise);
    return {
      ...pObj,
      health,
      budgetMetrics: budget
    };
  });

  // Filter in memory for delayState if specified ('overdue', 'behind_plan', 'stale')
  if (delayState) {
    if (delayState === 'overdue') {
      projects = projects.filter(p => p.health.isOverdue);
    } else if (delayState === 'behind_plan') {
      projects = projects.filter(p => p.health.isBehindPlan);
    } else if (delayState === 'stale') {
      projects = projects.filter(p => p.health.isStale);
    }
  }

  return {
    projects,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getProjectsForMap({ city }) {
  const query = { publicationState: 'Published', 'location.coordinates': { $exists: true } };
  if (city) query.city = new RegExp(`^${city}$`, 'i');

  const rawProjects = await Project.find(query)
    .populate('department', 'code name city')
    .populate('contractor', 'name')
    .limit(100);

  return rawProjects.map(p => {
    const pObj = p.toObject();
    const health = evaluateProjectHealth(pObj);
    return {
      id: pObj._id,
      projectCode: pObj.projectCode,
      title: pObj.title,
      workType: pObj.workType,
      city: pObj.city,
      locality: pObj.locality,
      executionState: pObj.executionState,
      location: pObj.location,
      department: pObj.department,
      health,
      featuredImage: pObj.featuredImage
    };
  });
}

export async function getProjectById(id, includeDrafts = false) {
  const project = await Project.findById(id)
    .populate('department')
    .populate('contractor');

  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    error.code = 'PROJECT_NOT_FOUND';
    throw error;
  }

  if (project.publicationState !== 'Published' && !includeDrafts) {
    const error = new Error('Project not found or is not published.');
    error.statusCode = 404;
    error.code = 'PROJECT_NOT_PUBLISHED';
    throw error;
  }

  const pObj = project.toObject();
  const health = evaluateProjectHealth(pObj);
  const budgetMetrics = calculateBudgetMetrics(pObj.estimatedBudgetPaise, pObj.actualExpenditurePaise);

  // Fetch recent updates
  const updates = await ProjectUpdate.find({ project: project._id })
    .populate('author', 'displayName role')
    .sort({ publishedAt: -1 })
    .limit(10);

  return {
    ...pObj,
    health,
    budgetMetrics,
    updates
  };
}

export async function createProjectDraft(data, user) {
  // Enforce department boundary for officers
  let departmentId = data.department;
  if (user.role === 'officer') {
    if (!user.department) {
      const err = new Error('Officer is not assigned to a department.');
      err.statusCode = 403;
      throw err;
    }
    departmentId = user.department._id || user.department;
  }

  const project = await Project.create({
    ...data,
    department: departmentId,
    publicationState: 'Draft',
    version: 1
  });

  await ActivityEvent.create({
    entityType: 'Project',
    entityId: project._id,
    actor: user._id,
    event: 'DRAFT_CREATED',
    details: { projectCode: project.projectCode, title: project.title }
  });

  return project;
}

export async function updateProject(id, updateData, expectedVersion, user) {
  const project = await Project.findById(id);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  // Department check: officer can only edit their own department's project
  if (user.role === 'officer') {
    const officerDeptId = (user.department?._id || user.department).toString();
    const projDeptId = project.department.toString();
    if (officerDeptId !== projDeptId) {
      const error = new Error('Forbidden: Officers can only modify projects belonging to their assigned department.');
      error.statusCode = 403;
      throw error;
    }
    if (updateData.department !== undefined && String(updateData.department) !== officerDeptId) {
      const error = new Error('Forbidden: Officers cannot transfer projects to another department.');
      error.statusCode = 403;
      throw error;
    }
  }

  // Optimistic concurrency check
  if (expectedVersion !== undefined && project.version !== expectedVersion) {
    const error = new Error(`Stale project version (Current: ${project.version}, Expected: ${expectedVersion}). Please reload and retry.`);
    error.statusCode = 409;
    error.code = 'VERSION_CONFLICT';
    throw error;
  }

  Object.assign(project, updateData);
  project.version += 1;
  project.lastUpdatedAt = new Date();
  await project.save();

  await ActivityEvent.create({
    entityType: 'Project',
    entityId: project._id,
    actor: user._id,
    event: 'PROJECT_UPDATED',
    details: { version: project.version }
  });

  return project;
}

export async function publishProject(id, user) {
  const project = await Project.findById(id);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'officer') {
    const officerDeptId = (user.department?._id || user.department).toString();
    if (officerDeptId !== project.department.toString()) {
      const error = new Error('Forbidden: Officers can only publish their own department projects.');
      error.statusCode = 403;
      throw error;
    }
  }

  // Milestone validation: weights must sum to 100 for publication
  if (project.milestones && project.milestones.length > 0) {
    const totalWeight = project.milestones.reduce((sum, m) => sum + (Number(m.weight) || 0), 0);
    if (totalWeight !== 100) {
      const error = new Error(`Cannot publish: Milestone weights must sum to exactly 100 (current total: ${totalWeight}).`);
      error.statusCode = 400;
      throw error;
    }
  }

  project.publicationState = 'Published';
  project.version += 1;
  project.lastUpdatedAt = new Date();
  await project.save();

  return project;
}

export async function addProjectUpdate(projectId, updateData, user) {
  const project = await Project.findById(projectId);
  if (!project) {
    const error = new Error('Project not found.');
    error.statusCode = 404;
    throw error;
  }

  if (user.role === 'officer') {
    const officerDeptId = (user.department?._id || user.department).toString();
    if (officerDeptId !== project.department.toString()) {
      const error = new Error('Forbidden: Officers can only update projects belonging to their department.');
      error.statusCode = 403;
      throw error;
    }
  }

  const update = await ProjectUpdate.create({
    project: project._id,
    author: user._id,
    title: updateData.title,
    narrative: updateData.narrative,
    progressSnapshot: updateData.progressSnapshot ?? 0,
    expenditureSnapshotPaise: updateData.expenditureSnapshotPaise ?? null,
    mediaUrls: updateData.mediaUrls || [],
    sourceProvenance: updateData.sourceProvenance || 'Official Update'
  });

  project.lastUpdatedAt = new Date();
  if (updateData.actualExpenditurePaise !== undefined) {
    project.actualExpenditurePaise = updateData.actualExpenditurePaise;
  }
  await project.save();

  return update;
}
