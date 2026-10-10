import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateCoordinationPair,
  getCanonicalPair,
  datesOverlap
} from '../src/utils/coordinationRules.js';

describe('Coordination Rules Engine Tests', () => {
  test('datesOverlap: accurately checks inclusive date overlap', () => {
    assert.equal(datesOverlap('2026-09-01', '2026-10-15', '2026-10-10', '2026-11-20'), true);
    assert.equal(datesOverlap('2026-09-01', '2026-10-15', '2026-10-15', '2026-11-20'), true); // inclusive boundary
    assert.equal(datesOverlap('2026-09-01', '2026-09-30', '2026-10-01', '2026-10-31'), false);
    assert.equal(datesOverlap(null, '2026-10-15', '2026-10-10', '2026-11-20'), null);
  });

  test('getCanonicalPair: orders pair IDs predictably regardless of argument order', () => {
    const pair1 = getCanonicalPair('id_abc', 'id_xyz');
    const pair2 = getCanonicalPair('id_xyz', 'id_abc');
    assert.equal(pair1.pairKey, 'id_abc::id_xyz');
    assert.equal(pair2.pairKey, 'id_abc::id_xyz');
  });

  test('Rule A: Shared Road Segment with Overlapping Dates produces Strong candidate', () => {
    const projA = {
      projectCode: 'PROJ-A',
      title: 'Road Resurfacing',
      roadSegmentIds: ['CHN-OMR-01'],
      plannedStartDate: '2026-09-01',
      originalDeadline: '2026-11-15'
    };
    const projB = {
      projectCode: 'PROJ-B',
      title: 'Pipeline Laying',
      roadSegmentIds: ['CHN-OMR-01'],
      plannedStartDate: '2026-09-15',
      originalDeadline: '2026-11-20'
    };

    const matches = evaluateCoordinationPair(projA, projB);
    const ruleA = matches.find(m => m.ruleId === 'RULE_A_SHARED_SEGMENT');

    assert.ok(ruleA);
    assert.equal(ruleA.confidence, 'Strong');
    assert.ok(ruleA.reason.includes('same road segment'));
  });

  test('Rule B: Nearby Concurrent Work (<= 200m) triggers potential disruption candidate', () => {
    const projA = {
      projectCode: 'PROJ-A',
      title: 'Drainage Work',
      roadSegmentIds: [],
      location: { coordinates: [80.2050, 13.0070] },
      plannedStartDate: '2026-09-01',
      originalDeadline: '2026-10-30'
    };
    const projB = {
      projectCode: 'PROJ-B',
      title: 'Cable Ducting',
      roadSegmentIds: [],
      location: { coordinates: [80.2060, 13.0075] }, // ~120m distance
      plannedStartDate: '2026-09-10',
      originalDeadline: '2026-10-25'
    };

    const matches = evaluateCoordinationPair(projA, projB);
    const ruleB = matches.find(m => m.ruleId === 'RULE_B_NEARBY_CONCURRENT');

    assert.ok(ruleB);
    assert.ok(ruleB.distanceMeters <= 200);
  });

  test('Rule C: Repeated Excavation triggers if subsequent work starts within 90 days', () => {
    const projA = {
      projectCode: 'PROJ-A',
      title: 'Road Resurfacing and Restoration',
      workType: 'Road Resurfacing',
      roadSegmentIds: ['CHN-ANNA-01'],
      plannedStartDate: '2026-07-01',
      actualCompletionDate: '2026-09-01'
    };
    const projB = {
      projectCode: 'PROJ-B',
      title: 'Sewer Line Trenching',
      workType: 'Sewer Excavation',
      roadSegmentIds: ['CHN-ANNA-01'],
      plannedStartDate: '2026-10-15', // 44 days after 2026-09-01
      originalDeadline: '2026-12-01'
    };

    const matches = evaluateCoordinationPair(projA, projB);
    const ruleC = matches.find(m => m.ruleId === 'RULE_C_REPEATED_EXCAVATION');

    assert.ok(ruleC);
    assert.equal(ruleC.gapDays, 44);
  });

  test('Rule D: Completion Uncertainty triggers if earlier work is ongoing past forecast', () => {
    const projA = {
      projectCode: 'PROJ-A',
      title: 'Delayed Underpass',
      executionState: 'Ongoing',
      roadSegmentIds: ['BLR-ORR-01'],
      plannedStartDate: '2026-05-01',
      originalDeadline: '2026-08-30' // forecast expired before 2026-10-10
    };
    const projB = {
      projectCode: 'PROJ-B',
      title: 'New Feeder Pipe',
      executionState: 'Ongoing',
      roadSegmentIds: ['BLR-ORR-01'],
      plannedStartDate: '2026-10-01',
      originalDeadline: '2026-12-01'
    };

    const matches = evaluateCoordinationPair(projA, projB, '2026-10-10');
    const ruleD = matches.find(m => m.ruleId === 'RULE_D_COMPLETION_UNCERTAINTY');

    assert.ok(ruleD);
    assert.equal(ruleD.overdueProject, 'PROJ-A');
  });
});
