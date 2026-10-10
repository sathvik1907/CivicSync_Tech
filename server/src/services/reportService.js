import crypto from 'crypto';
import { Report } from '../models/Report.js';
import { Project } from '../models/Project.js';
import { ActivityEvent } from '../models/ActivityEvent.js';
import { IdempotencyRecord } from '../models/IdempotencyRecord.js';
import { get250mGridCell } from '../utils/geo.js';

export async function createReport(data, residentUser, idempotencyKey) {
  // Check idempotency if key provided
  if (idempotencyKey) {
    const existingRecord = await IdempotencyRecord.findOne({
      actor: residentUser._id,
      operation: 'CREATE_REPORT',
      idempotencyKey
    });
    if (existingRecord) {
      return existingRecord.responseBody;
    }
  }

  const { category, description, privateLocation, projectId, mediaUrls = [] } = data;

  if (!category || !description) {
    const error = new Error('Category and description are required.');
    error.statusCode = 400;
    throw error;
  }

  if (mediaUrls.length > 3) {
    const error = new Error('Maximum of 3 photographs allowed per report.');
    error.statusCode = 400;
    throw error;
  }

  // Automatic routing: if linked to project, assign to project's department
  let departmentId = null;
  let linkedProject = null;
  if (projectId) {
    linkedProject = await Project.findById(projectId);
    if (linkedProject) {
      departmentId = linkedProject.department;
    }
  }

  // Generate durable unique reference code
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const referenceCode = `RPT-2026-${randomSuffix}`;

  // Compute 250m privacy grid cell
  let publicGridCell = undefined;
  if (privateLocation?.coordinates && Array.isArray(privateLocation.coordinates)) {
    const [lon, lat] = privateLocation.coordinates;
    const cell = get250mGridCell(lat, lon);
    if (cell) {
      publicGridCell = cell;
    }
  }

  const report = await Report.create({
    referenceCode,
    resident: residentUser._id,
    project: linkedProject ? linkedProject._id : null,
    category,
    description: description.trim(),
    privateLocation: privateLocation || {},
    publicGridCell,
    department: departmentId,
    status: 'Submitted',
    mediaUrls,
    idempotencyKey: idempotencyKey || null,
    statusHistory: [
      {
        status: 'Submitted',
        changedBy: residentUser._id,
        response: 'Civic report submitted by resident.',
        changedAt: new Date()
      }
    ]
  });

  await ActivityEvent.create({
    entityType: 'Report',
    entityId: report._id,
    actor: residentUser._id,
    event: 'REPORT_SUBMITTED',
    details: { referenceCode, category }
  });

  const responseData = {
    id: report._id,
    referenceCode: report.referenceCode,
    status: report.status,
    category: report.category,
    createdAt: report.createdAt
  };

  // Save idempotency record
  if (idempotencyKey) {
    await IdempotencyRecord.create({
      actor: residentUser._id,
      operation: 'CREATE_REPORT',
      idempotencyKey,
      requestHash: crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex'),
      statusCode: 201,
      responseBody: responseData,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
  }

  return responseData;
}

export async function getMyReports(residentUser, { page = 1, limit = 20 }) {
  const query = { resident: residentUser._id };
  const skip = (Math.max(1, page) - 1) * limit;
  const total = await Report.countDocuments(query);

  const reports = await Report.find(query)
    .populate('project', 'title projectCode workType')
    .populate('department', 'name code')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    reports,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function getReportById(id, currentUser) {
  const report = await Report.findById(id)
    .populate('project', 'title projectCode workType city locality')
    .populate('department', 'name code city')
    .populate('assignee', 'displayName')
    .populate('statusHistory.changedBy', 'displayName role');

  if (!report) {
    const error = new Error('Report not found.');
    error.statusCode = 404;
    throw error;
  }

  // Authorization check:
  // Resident can only view their own report
  if (currentUser.role === 'resident') {
    if (report.resident.toString() !== currentUser._id.toString()) {
      const error = new Error('Forbidden: You can only view your own submitted reports.');
      error.statusCode = 403;
      throw error;
    }
  }

  // Officer can only view reports routed to their assigned department
  if (currentUser.role === 'officer') {
    const officerDeptId = (currentUser.department?._id || currentUser.department).toString();
    if (!report.department || report.department._id.toString() !== officerDeptId) {
      const error = new Error('Forbidden: Officers can only access reports assigned to their department.');
      error.statusCode = 403;
      throw error;
    }
  }

  return report;
}

export async function getAdminReports(user, { departmentId, status, page = 1, limit = 20 }) {
  const query = {};

  if (user.role === 'officer') {
    const officerDeptId = user.department?._id || user.department;
    query.department = officerDeptId;
  } else if (departmentId) {
    if (departmentId === 'unassigned') {
      query.department = null;
    } else {
      query.department = departmentId;
    }
  }

  if (status) {
    query.status = status;
  }

  const skip = (Math.max(1, page) - 1) * limit;
  const total = await Report.countDocuments(query);

  const reports = await Report.find(query)
    .populate('project', 'title projectCode')
    .populate('department', 'name code')
    .populate('resident', 'displayName emailNormalized')
    .populate('assignee', 'displayName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    reports,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    }
  };
}

export async function transitionReportStatus(id, { action, response, rejectionReason, departmentId, assigneeId }, user) {
  const report = await Report.findById(id);
  if (!report) {
    const error = new Error('Report not found.');
    error.statusCode = 404;
    throw error;
  }

  // Enforce department access for officers
  if (user.role === 'officer') {
    const officerDeptId = (user.department?._id || user.department).toString();
    if (!report.department || report.department.toString() !== officerDeptId) {
      const error = new Error('Forbidden: Officer cannot act on reports outside their assigned department.');
      error.statusCode = 403;
      throw error;
    }
  }

  let nextStatus = report.status;
  const oldStatus = report.status;

  switch (action) {
    case 'REVIEW':
      nextStatus = 'Under Review';
      break;

    case 'ASSIGN':
      // Reassigning across departments requires coordinator authority
      if (departmentId && departmentId !== String(report.department) && user.role !== 'coordinator') {
        const error = new Error('Forbidden: Cross-department reassignment requires municipal coordinator authority.');
        error.statusCode = 403;
        throw error;
      }
      if (departmentId) report.department = departmentId;
      if (assigneeId) report.assignee = assigneeId;
      nextStatus = 'Assigned';
      break;

    case 'START_WORK':
      nextStatus = 'In Progress';
      break;

    case 'RESOLVE':
      if (!response || response.trim().length === 0) {
        const error = new Error('An official resolution response is required to resolve a report.');
        error.statusCode = 400;
        throw error;
      }
      nextStatus = 'Resolved';
      report.officialResponse = response.trim();
      break;

    case 'REJECT':
      if (!rejectionReason || rejectionReason.trim().length === 0) {
        const error = new Error('A mandatory rejection reason must be provided to reject a report.');
        error.statusCode = 400;
        throw error;
      }
      nextStatus = 'Rejected';
      report.rejectionReason = rejectionReason.trim();
      break;

    case 'REOPEN':
      if (user.role !== 'coordinator' && user.role !== 'officer') {
        const error = new Error('Forbidden: Only officials can reopen a report.');
        error.statusCode = 403;
        throw error;
      }
      nextStatus = 'In Progress';
      break;

    default:
      const error = new Error(`Unsupported report action: ${action}`);
      error.statusCode = 400;
      throw error;
  }

  report.status = nextStatus;
  report.version += 1;
  report.statusHistory.push({
    status: nextStatus,
    changedBy: user._id,
    response: response || '',
    reason: rejectionReason || '',
    changedAt: new Date()
  });

  await report.save();

  await ActivityEvent.create({
    entityType: 'Report',
    entityId: report._id,
    actor: user._id,
    event: `STATUS_${action}`,
    details: { oldStatus, nextStatus, referenceCode: report.referenceCode }
  });

  return report;
}
