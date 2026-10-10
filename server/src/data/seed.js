import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Contractor } from '../models/Contractor.js';
import { RoadSegment } from '../models/RoadSegment.js';
import { Project } from '../models/Project.js';
import { ProjectUpdate } from '../models/ProjectUpdate.js';
import { Report } from '../models/Report.js';
import { ConflictDecision } from '../models/ConflictDecision.js';
import { get250mGridCell } from '../utils/geo.js';
import { getCanonicalPair } from '../utils/coordinationRules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSeed() {
  console.log('[Seed] Connecting to MongoDB...');
  await connectDB();

  console.log('[Seed] Seeding departments...');
  const deptData = JSON.parse(fs.readFileSync(path.join(__dirname, 'departments.json'), 'utf-8'));
  const deptMap = new Map();

  for (const d of deptData) {
    const dept = await Department.findOneAndUpdate(
      { code: d.code },
      { $set: d },
      { upsert: true, new: true }
    );
    deptMap.set(d.code, dept._id);
  }

  console.log('[Seed] Seeding contractors...');
  const contractorsData = [
    { name: 'Apex Roadlines & Construction', registrationNumber: 'REG-TN-2018-091', contactEmail: 'info@apexroadlines.com', contactPhone: '+91-44-2450-8800' },
    { name: 'Chennai Southern Infra Works', registrationNumber: 'REG-TN-2019-142', contactEmail: 'projects@csinfra.com', contactPhone: '+91-44-2450-9900' },
    { name: 'Coromandel Civil Works Pvt Ltd', registrationNumber: 'REG-TN-2015-044', contactEmail: 'contact@coromandelcivil.in', contactPhone: '+91-44-2820-1122' },
    { name: 'Deccan Urban Utilities Corp', registrationNumber: 'REG-KA-2017-302', contactEmail: 'tenders@deccanutilities.com', contactPhone: '+91-80-4122-3344' },
    { name: 'Larsen & Infrastructures Ltd', registrationNumber: 'REG-NAT-2010-889', contactEmail: 'urban.infra@larsengroup.com', contactPhone: '+91-22-6758-2000' }
  ];

  const contractorMap = new Map();
  for (const c of contractorsData) {
    const contractor = await Contractor.findOneAndUpdate(
      { name: c.name },
      { $set: c },
      { upsert: true, new: true }
    );
    contractorMap.set(c.name, contractor._id);
  }

  console.log('[Seed] Seeding road segments...');
  const roadSegmentsData = [
    { city: 'Chennai', corridorCode: 'OMR', segmentCode: 'CHN-OMR-01', startLabel: 'Tidel Park Junction', endLabel: 'SRP Tools Junction' },
    { city: 'Chennai', corridorCode: 'OMR', segmentCode: 'CHN-OMR-02', startLabel: 'SRP Tools Junction', endLabel: 'Thoraipakkam Toll Plaza' },
    { city: 'Chennai', corridorCode: 'GST', segmentCode: 'CHN-GST-01', startLabel: 'Guindy Industrial Estate', endLabel: 'Kathipara Junction' },
    { city: 'Chennai', corridorCode: 'ANNA_SALAI', segmentCode: 'CHN-ANNA-01', startLabel: 'Nandanam Signal', endLabel: 'Saidapet Bridge' },
    { city: 'Bengaluru', corridorCode: 'ORR', segmentCode: 'BLR-ORR-01', startLabel: 'Marathahalli Bridge', endLabel: 'Bellandur EcoSpace' },
    { city: 'Hyderabad', corridorCode: 'HITEC', segmentCode: 'HYD-HITEC-01', startLabel: 'Cyber Towers Junction', endLabel: 'Bio-Diversity Park' }
  ];

  for (const r of roadSegmentsData) {
    await RoadSegment.findOneAndUpdate(
      { segmentCode: r.segmentCode },
      { $set: r },
      { upsert: true }
    );
  }

  console.log('[Seed] Seeding demo users...');
  const residentHash = await bcrypt.hash('ResidentPass123!', 10);
  const officerHash = await bcrypt.hash('OfficerPass123!', 10);
  const coordHash = await bcrypt.hash('CoordPass123!', 10);

  const residentUser = await User.findOneAndUpdate(
    { emailNormalized: 'resident@civicsync.demo' },
    {
      $set: {
        emailNormalized: 'resident@civicsync.demo',
        passwordHash: residentHash,
        displayName: 'Priya Ramanathan (Resident)',
        role: 'resident',
        active: true
      }
    },
    { upsert: true, new: true }
  );

  const gccDeptId = deptMap.get('GCC-ROADS');
  const officerUser = await User.findOneAndUpdate(
    { emailNormalized: 'officer.gcc@civicsync.demo' },
    {
      $set: {
        emailNormalized: 'officer.gcc@civicsync.demo',
        passwordHash: officerHash,
        displayName: 'K. Senthil Kumar (Executive Engineer, GCC)',
        role: 'officer',
        department: gccDeptId,
        active: true
      }
    },
    { upsert: true, new: true }
  );

  const coordUser = await User.findOneAndUpdate(
    { emailNormalized: 'coordinator@civicsync.demo' },
    {
      $set: {
        emailNormalized: 'coordinator@civicsync.demo',
        passwordHash: coordHash,
        displayName: 'Dr. Anita Deshmukh (Municipal Chief Coordinator)',
        role: 'coordinator',
        active: true
      }
    },
    { upsert: true, new: true }
  );

  console.log('[Seed] Seeding projects...');
  const projectsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'projects.json'), 'utf-8'));
  const projectMap = new Map();

  for (const p of projectsData) {
    const deptId = deptMap.get(p.departmentCode);
    const contractorId = contractorMap.get(p.contractorName) || null;

    const projectDoc = {
      projectCode: p.projectCode,
      title: p.title,
      description: p.description,
      purpose: p.purpose,
      workType: p.workType,
      city: p.city,
      locality: p.locality,
      department: deptId,
      contractor: contractorId,
      location: p.location,
      roadSegmentIds: p.roadSegmentIds,
      publicationState: p.publicationState,
      executionState: p.executionState,
      plannedStartDate: p.plannedStartDate,
      originalDeadline: p.originalDeadline,
      revisedForecastDate: p.revisedForecastDate,
      actualStartDate: p.actualStartDate,
      actualCompletionDate: p.actualCompletionDate,
      delayExplanation: p.delayExplanation,
      estimatedBudgetPaise: p.estimatedBudgetPaise,
      actualExpenditurePaise: p.actualExpenditurePaise,
      milestones: p.milestones,
      featuredImage: p.featuredImage || '',
      beforeAfterPair: p.beforeAfterPair || null,
      sourceLabel: p.sourceLabel,
      demoOrigin: p.demoOrigin,
      lastUpdatedAt: new Date('2026-10-05T10:00:00Z'),
      version: 1
    };

    const savedProject = await Project.findOneAndUpdate(
      { projectCode: p.projectCode },
      { $set: projectDoc },
      { upsert: true, new: true }
    );
    projectMap.set(p.projectCode, savedProject);
  }

  console.log('[Seed] Seeding project updates...');
  const omrProj = projectMap.get('CHN-GCC-2026-001');
  if (omrProj) {
    await ProjectUpdate.findOneAndUpdate(
      { project: omrProj._id, title: 'Phase 1 Cold-Milling Complete' },
      {
        $set: {
          project: omrProj._id,
          author: officerUser._id,
          title: 'Phase 1 Cold-Milling Complete',
          narrative: 'Asphalt milling machines successfully leveled 1.2km of damaged pavement between Tidel Park and SRP Tools. Dense Bituminous Macadam (DBM) base layer laying has commenced during nighttime hours.',
          progressSnapshot: 55,
          expenditureSnapshotPaise: 2150000000,
          sourceProvenance: 'GCC Ward 173 Inspection Log',
          publishedAt: new Date('2026-10-02T18:30:00Z')
        }
      },
      { upsert: true }
    );
  }

  console.log('[Seed] Seeding resident reports...');
  const reportsData = [
    {
      referenceCode: 'RPT-2026-A1091',
      resident: residentUser._id,
      projectCode: 'CHN-GCC-2026-001',
      category: 'Potholes',
      description: 'Severe edge depression and uncompacted aggregate gravel along the bus bay near Tidel Park gate. Causing two-wheelers to skid.',
      location: {
        address: 'OMR Northbound Bus Bay, Taramani',
        city: 'Chennai',
        locality: 'Taramani',
        coordinates: [80.2455, 12.9890]
      },
      status: 'In Progress',
      officialResponse: 'Field engineers have inspected the site. Pothole filler truck dispatched for night asphalt rectification.',
      statusHistory: [
        { status: 'Submitted', changedBy: residentUser._id, response: 'Report submitted.', changedAt: new Date('2026-09-28T09:00:00Z') },
        { status: 'Under Review', changedBy: officerUser._id, response: 'Assigned to Ward 173 assistant engineer.', changedAt: new Date('2026-09-29T11:00:00Z') },
        { status: 'In Progress', changedBy: officerUser._id, response: 'Compaction team at site.', changedAt: new Date('2026-10-01T14:00:00Z') }
      ],
      mediaUrls: ['/images/issues/pothole_reported.jpg']
    },
    {
      referenceCode: 'RPT-2026-B2042',
      resident: residentUser._id,
      projectCode: 'CHN-SWD-2026-003',
      category: 'Waterlogging',
      description: 'Water accumulation of approximately 1 foot depth near Kathipara bridge ramp after brief rain spell.',
      location: {
        address: 'GST Road Kathipara Descent, Guindy',
        city: 'Chennai',
        locality: 'Guindy',
        coordinates: [80.2052, 13.0072]
      },
      status: 'Assigned',
      officialResponse: 'Work orders linked to ongoing GCC-SWD Kathipara drainage project.',
      statusHistory: [
        { status: 'Submitted', changedBy: residentUser._id, response: 'Report submitted.', changedAt: new Date('2026-10-02T16:30:00Z') },
        { status: 'Assigned', changedBy: coordUser._id, response: 'Routed to Stormwater Drainage Division.', changedAt: new Date('2026-10-03T10:15:00Z') }
      ],
      mediaUrls: ['/images/issues/waterlogging_street.jpg']
    },
    {
      referenceCode: 'RPT-2026-C3088',
      resident: residentUser._id,
      projectCode: null,
      category: 'Broken footpaths',
      description: 'Damaged paver tiles and exposed reinforcing iron rebar on North Mada Street footpath, creating tripping hazard for senior citizens.',
      location: {
        address: 'Near Kapaleeshwarar Temple North Gate',
        city: 'Chennai',
        locality: 'Mylapore',
        coordinates: [80.2685, 13.0340]
      },
      status: 'Resolved',
      officialResponse: 'Footpath paving contractor has replaced cracked tiles and installed protective safety curbs.',
      statusHistory: [
        { status: 'Submitted', changedBy: residentUser._id, response: 'Report submitted.', changedAt: new Date('2026-09-15T08:00:00Z') },
        { status: 'Under Review', changedBy: officerUser._id, response: 'Site inspected.', changedAt: new Date('2026-09-16T12:00:00Z') },
        { status: 'In Progress', changedBy: officerUser._id, response: 'Paver repairs initiated.', changedAt: new Date('2026-09-18T10:00:00Z') },
        { status: 'Resolved', changedBy: officerUser._id, response: 'Repairs completed and verified.', changedAt: new Date('2026-09-22T17:00:00Z') }
      ],
      mediaUrls: ['/images/issues/footpath_broken_issue.jpg']
    },
    {
      referenceCode: 'RPT-2026-D4019',
      resident: residentUser._id,
      projectCode: null,
      category: 'Streetlight failures',
      description: 'Three consecutive street lights are not functioning on Marina Beach promenade service road.',
      location: {
        address: 'Marina Beach Service Lane, Triplicane',
        city: 'Chennai',
        locality: 'Marina',
        coordinates: [80.2805, 13.0515]
      },
      status: 'Resolved',
      officialResponse: 'Defective LED driver module replaced by electrical maintenance contractor.',
      statusHistory: [
        { status: 'Submitted', changedBy: residentUser._id, response: 'Report submitted.', changedAt: new Date('2026-09-20T20:00:00Z') },
        { status: 'Resolved', changedBy: officerUser._id, response: 'Restored service on same evening.', changedAt: new Date('2026-09-21T18:00:00Z') }
      ],
      mediaUrls: ['/images/issues/broken_light.jpg']
    }
  ];

  for (const r of reportsData) {
    const proj = r.projectCode ? projectMap.get(r.projectCode) : null;
    const deptId = proj ? proj.department : deptMap.get('GCC-ROADS');
    const cell = get250mGridCell(r.location.coordinates[1], r.location.coordinates[0]);

    await Report.findOneAndUpdate(
      { referenceCode: r.referenceCode },
      {
        $set: {
          referenceCode: r.referenceCode,
          resident: r.resident,
          project: proj ? proj._id : null,
          category: r.category,
          description: r.description,
          privateLocation: r.location,
          publicGridCell: cell,
          department: deptId,
          status: r.status,
          officialResponse: r.officialResponse,
          statusHistory: r.statusHistory,
          mediaUrls: r.mediaUrls,
          version: 1
        }
      },
      { upsert: true }
    );
  }

  console.log('[Seed] Seeding sample conflict decision...');
  const projA = projectMap.get('CHN-GCC-2026-001');
  const projB = projectMap.get('CHN-CMW-2026-002');
  if (projA && projB) {
    const canonical = getCanonicalPair(projA._id, projB._id);
    await ConflictDecision.findOneAndUpdate(
      { pairKey: canonical.pairKey },
      {
        $set: {
          pairKey: canonical.pairKey,
          projectA: projA._id,
          projectB: projB._id,
          ruleId: 'RULE_A_SHARED_SEGMENT',
          ruleVersion: '1.0',
          inputFingerprint: 'demo_fingerprint_omr',
          decision: 'Coordinated',
          explanation: 'Coordinated joint site protocol agreed between GCC Works and CMWSSB: CMWSSB pipeline trenching will precede asphalt wearing course laying. Resurfacing contractor Apex Roadlines will withhold final 40mm wearing layer until pipeline backfilling passes joint compaction inspection.',
          decidedBy: coordUser._id,
          decidedAt: new Date('2026-09-20T11:00:00Z')
        }
      },
      { upsert: true }
    );
  }

  console.log('----------------------------------------------------');
  console.log(' CivicSync Seed Complete!');
  console.log(' Total Projects Seeded: 18');
  console.log(' Total Reports Seeded:  4');
  console.log(' Demo Accounts:');
  console.log('   - Resident:    resident@civicsync.demo    / ResidentPass123!');
  console.log('   - Officer:     officer.gcc@civicsync.demo / OfficerPass123!');
  console.log('   - Coordinator: coordinator@civicsync.demo / CoordPass123!');
  console.log('----------------------------------------------------');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed()
    .then(() => disconnectDB())
    .catch((err) => {
      console.error('[Seed] Error:', err);
      process.exit(1);
    });
}
