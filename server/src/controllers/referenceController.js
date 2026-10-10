import { Department } from '../models/Department.js';
import { RoadSegment } from '../models/RoadSegment.js';

export async function getReferenceData(req, res, next) {
  try {
    const departments = await Department.find().sort({ name: 1 });
    const roadSegments = await RoadSegment.find().sort({ segmentCode: 1 });

    const categories = [
      'Potholes',
      'Damaged roads',
      'Drainage problems',
      'Waterlogging',
      'Water pipeline problems',
      'Broken footpaths',
      'Streetlight failures',
      'Exposed cables',
      'Incomplete work',
      'Other civic issues'
    ];

    const cities = ['Chennai', 'Bengaluru', 'Hyderabad'];

    res.json({
      departments,
      roadSegments,
      categories,
      cities
    });
  } catch (error) {
    next(error);
  }
}
