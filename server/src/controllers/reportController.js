import * as reportService from '../services/reportService.js';

export async function submitReport(req, res, next) {
  try {
    const idempotencyKey = req.headers['idempotency-key'];
    const result = await reportService.createReport(req.body, req.user, idempotencyKey);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMyReports(req, res, next) {
  try {
    const { page, limit } = req.query;
    const result = await reportService.getMyReports(req.user, {
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10)
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAdminReports(req, res, next) {
  try {
    const { departmentId, status, page, limit } = req.query;
    const result = await reportService.getAdminReports(req.user, {
      departmentId,
      status,
      page: parseInt(page || '1', 10),
      limit: parseInt(limit || '20', 10)
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getReportDetails(req, res, next) {
  try {
    const report = await reportService.getReportById(req.params.id, req.user);
    res.json({ report });
  } catch (error) {
    next(error);
  }
}

export async function handleReportAction(req, res, next) {
  try {
    const report = await reportService.transitionReportStatus(req.params.id, req.body, req.user);
    res.json({ report });
  } catch (error) {
    next(error);
  }
}
