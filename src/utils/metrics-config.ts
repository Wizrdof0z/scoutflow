// Metrics Configuration for Player Rating Calculator
// Converted from metrics.js for use in React/TypeScript

export interface Metric {
  id: string;
  label: string;
  weight: number;
}

export interface Section {
  name: string;
  emoji?: string;
  weight: number;
  metrics: Metric[];
}

export interface Profile {
  name: string;
  emoji?: string;
  sections: Section[];
}

export interface PositionGroup {
  name: string;
  emoji: string;
  profiles: string[];
}

// Position Groups - Maps player positions to their available subprofiles
export const POSITION_GROUPS: Record<string, PositionGroup> = {
  'fullbacks': {
    name: 'Fullbacks',
    emoji: '🔀',
    profiles: ['intense_fullback', 'technical_fullback']
  },
  'centre_backs': {
    name: 'Centre Backs', 
    emoji: '🛡️',
    profiles: ['physical_centre_back', 'technical_centre_back']
  },
  'midfield': {
    name: 'Midfield',
    emoji: '⚙️', 
    profiles: ['pivot', 'box_to_box']
  },
  'wingers': {
    name: 'Wingers',
    emoji: '⚡',
    profiles: ['traditional_winger', 'inverted_winger']
  },
  'centre_forward': {
    name: 'Centre Forward',
    emoji: '🎯',
    profiles: ['direct_striker', 'second_striker']
  }
};

// Map player PositionProfile to Position Group
export const POSITION_TO_GROUP: Record<string, string> = {
  'Left Fullback': 'fullbacks',
  'Right Fullback': 'fullbacks',
  'Centre Back': 'centre_backs',
  'Defensive Midfielder': 'midfield',
  'Central Midfielder': 'midfield',
  'Attacking Midfielder': 'midfield',
  'Left Winger': 'wingers',
  'Right Winger': 'wingers',
  'Centre Forward': 'centre_forward',
};

// Profile configurations with all metrics and weights
export const PROFILES: Record<string, Profile> = {
  'intense_fullback': {
    name: 'Intense Fullback',
    emoji: '⚡',
    sections: [
      {
        name: 'Physical Metrics',
        emoji: '💪',
        weight: 3,
        metrics: [
          { id: 'maxSpeed', label: 'Max Speed', weight: 2 },
          { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 2 },
          { id: 'timeToSprintTop3', label: 'Time to Sprint Top 3', weight: 2 },
          { id: 'timeToHsrTop3', label: 'Time to HSR Top 3', weight: 1 },
          { id: 'explosiveAccelSprint', label: 'Explosive Acceleration to Sprint (P90)', weight: 1 },
          { id: 'explosiveAccelHsr', label: 'Explosive Acceleration to HSR (P90)', weight: 1 },
          { id: 'sprintCount', label: 'Sprint Count', weight: 2 },
          { id: 'HiDistance', label: 'High Intensity Distance per 90min', weight: 1 },
        ]
      },
      {
        name: 'Movement',
        emoji: '🏃',
        weight: 3,
        metrics: [
          { id: 'overlaps', label: 'Overlaps', weight: 2 },
          { id: 'overlapsThreat', label: 'Overlaps Threat', weight: 1 },
          { id: 'underlaps', label: 'Underlaps', weight: 2 },
          { id: 'underlapsThreat', label: 'Underlaps Threat', weight: 1 },
          { id: 'runsAhead', label: 'Runs Ahead', weight: 1 },
          { id: 'runsInBehind', label: 'Runs in Behind', weight: 1 },
          { id: 'runsAheadThreat', label: 'Runs Ahead Threat', weight: 1 }
        ]
      },
      {
        name: 'Passing Metrics',
        emoji: '⚽',
        weight: 1,
        metrics: [
          { id: 'passAttemptsRunsInBehind', label: 'Pass Attempts Runs In Behind', weight: 1 },
          { id: 'passAttemptsRunsAhead', label: 'Pass Attempts Runs Ahead', weight: 1 },
          { id: 'passAttemptsCross', label: 'Pass Attempts Cross Receiver', weight: 2 },
          { id: 'passCompletionCross', label: 'Pass Completion Cross Receiver', weight: 2 }
        ]
      },
      {
        name: 'Pressure Handling',
        emoji: '🔥',
        weight: 1,
        metrics: [
          { id: 'ballRetentionHigh', label: 'Ball Retention Under High Pressure', weight: 1 },
          { id: 'passCompletionHigh', label: 'Pass Completion Under High Pressure', weight: 1 },
          { id: 'dangerousPassAttemptsHigh', label: 'Dangerous Pass Attempts Under High Pressure', weight: 1 },
          { id: 'dangerousPassHigh', label: 'Dangerous Pass Completion Under High Pressure', weight: 1 },
          { id: 'difficultPassAttemptsHigh', label: 'Difficult Pass Attempts Under High Pressure', weight: 1 },
          { id: 'difficultPassHigh', label: 'Difficult Pass Completion Under High Pressure', weight: 1 }
        ]
      },
      {
        name: 'Defensive Actions',
        emoji: '🛡️',
        weight: 2,
        metrics: [
          { id: 'onBallEngagementsOTIP', label: 'On-Ball Engagements OTIP', weight: 2 },
          { id: 'counterPressingEngagements', label: 'Counter Pressing Engagements', weight: 1 },
          { id: 'pressingEngagements', label: 'Pressing Engagements', weight: 1 },
          { id: 'pressureEngagements', label: 'Pressure Engagements', weight: 1 },
          { id: 'beatenByMovement', label: 'Beaten by Movement', weight: 2 },
          { id: 'beatenByPossession', label: 'Beaten By Possession', weight: 2 },
          { id: 'forceBackward', label: 'Force Backward per 30 OTIP', weight: 1 },
          { id: 'regains', label: 'Regains per 30 OTIP', weight: 1 },
        ]
      }
    ]
  },

  'technical_fullback': {
    name: 'Technical Fullback',
    emoji: '🎯',
    sections: [
      {
        name: 'Physical Metrics',
        weight: 2,
        metrics: [
          { id: 'maxSpeed', label: 'Max Speed', weight: 1 },
          { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 1 },
          { id: 'mediumAccelCount', label: 'Medium Acceleration Count', weight: 1 },
          { id: 'highAccelCount', label: 'High Acceleration Count', weight: 1 },
          { id: 'explosiveAccelSprint', label: 'Explosive Acceleration to Sprint (P90)', weight: 1 },
          { id: 'explosiveAccelHsr', label: 'Explosive Acceleration to HSR (P90)', weight: 1 },
          { id: 'sprintCount', label: 'Sprint Count', weight: 2 }
        ]
      },
      {
        name: 'Movement',
        weight: 1,
        metrics: [
          { id: 'pullingWideRuns', label: 'Pulling Wide Runs', weight: 2 },
          { id: 'pullingWideRunsThreat', label: 'Pulling Wide Runs Threat', weight: 1 },
          { id: 'supportRuns', label: 'Support Runs', weight: 2 },
          { id: 'runsAhead', label: 'Runs Ahead', weight: 1 },
          { id: 'runsAheadThreat', label: 'Runs Ahead Threat', weight: 1 },
          { id: 'halfSpaceRuns', label: 'Half Space Runs', weight: 2 },
          { id: 'halfSpaceRunsThreat', label: 'Half Space Runs Threat', weight: 1 }
        ]
      },
      {
        name: 'Passing Metrics',
        weight: 3,
        metrics: [
          { id: 'passAttemptsCross', label: 'Pass Attempts Cross Receiver', weight: 1 },
          { id: 'passCompletionCross', label: 'Pass Completion Cross Receiver', weight: 1 },
          { id: 'passAttemptsRunsInBehind', label: 'Pass Attempts Runs in Behind', weight: 1 },
          { id: 'passCompletionRunsInBehind', label: 'Pass Completion Runs in Behind', weight: 1 },
          { id: 'passAttemptsRunsAhead', label: 'Pass Attempts Runs Ahead', weight: 2 },
          { id: 'passCompletionRunsAhead', label: 'Pass Completion Runs Ahead', weight: 1 },
          { id: 'passCompletionToRuns', label: 'Pass Completion to Player Making a Run', weight: 2 }
        ]
      },
      {
        name: 'Pressure Handling',
        weight: 2,
        metrics: [
          { id: 'ballRetentionHigh', label: 'Ball Retention Under High Pressure', weight: 2 },
          { id: 'passCompletionHigh', label: 'Pass Completion Under High Pressure', weight: 1 },
          { id: 'ballRetentionMedium', label: 'Ball Retention Under Medium Pressure', weight: 1 },
          { id: 'passCompletionMedium', label: 'Pass Completion Under Medium Pressure', weight: 1 },
          { id: 'ballRetentionLow', label: 'Ball Retention Under Low Pressure', weight: 1 },
          { id: 'passCompletionLow', label: 'Pass Completion Under Low Pressure', weight: 1 },
          { id: 'dangerousPassHigh', label: 'Dangerous Pass Completion Under High Pressure', weight: 1 },
          { id: 'difficultPassHigh', label: 'Difficult Pass Completion Under High Pressure', weight: 1 },
        ]
      },
      {
        name: 'Defensive Actions',
        weight: 2,
        metrics: [
          { id: 'onBallEngagementsOTIP', label: 'On-Ball Engagements OTIP', weight: 2 },
          { id: 'counterPressingEngagements', label: 'Counter Pressing Engagements', weight: 1 },
          { id: 'pressingEngagements', label: 'Pressing Engagements', weight: 1 },
          { id: 'pressureEngagements', label: 'Pressure Engagements', weight: 1 },
          { id: 'beatenByMovement', label: 'Beaten by Movement', weight: 2 },
          { id: 'beatenByPossession', label: 'Beaten By Possession', weight: 2 },
          { id: 'forceBackward', label: 'Force Backward per 30 OTIP', weight: 1 },
          { id: 'regains', label: 'Regains per 30 OTIP', weight: 1 }
        ]
      }
    ]
  },

  'physical_centre_back': {
    name: 'Physical Centre Back',
    sections: [
      {
        name: 'Physical Metrics',
        weight: 4,
        metrics: [
          { id: 'maxSpeed', label: 'Max Speed', weight: 2 },
          { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 2 },
          { id: 'timeToSprintTop3', label: 'Time to Sprint Top 3', weight: 1 },
          { id: 'timeToHsrTop3', label: 'Time to HSR Top 3', weight: 1 },
          { id: 'highAccelCount', label: 'High Acceleration Count', weight: 2 },
          { id: 'highDecelCount', label: 'High Deceleration Count', weight: 2 },
        ]
      },
      {
        name: 'Movement',
        weight: 1,
        metrics: [
          { id: 'droppingOffRuns', label: 'Dropping Off Runs', weight: 1 },
          { id: 'pullingWideRuns', label: 'Pulling Wide Runs', weight: 1 },
          { id: 'comingShort', label: 'Coming Short', weight: 1 },
        ]
      },
      {
        name: 'Passing Metrics',
        weight: 1,
        metrics: [
          { id: 'passCompletionComingShort', label: 'Pass Completion Coming Short', weight: 2 },
          { id: 'passCompletionRunsAhead', label: 'Pass Completion Runs Ahead', weight: 1 },
          { id: 'passCompletionPullingHalfSpace', label: 'Pass Completion Pulling Half Space', weight: 1 },
          { id: 'passCompletionPullingWide', label: 'Pass Completion Pulling Wide', weight: 1 },
        ]
      },
      {
        name: 'Pressure Handling',
        weight: 1,
        metrics: [
          { id: 'ballRetentionHigh', label: 'Ball Retention Under High Pressure', weight: 1 },
          { id: 'passCompletionHigh', label: 'Pass Completion Under High Pressure', weight: 2 },
          { id: 'ballRetentionMedium', label: 'Ball Retention Under Medium Pressure', weight: 1 },
          { id: 'passCompletionMedium', label: 'Pass Completion Under Medium Pressure', weight: 2 },
          { id: 'ballRetentionLow', label: 'Ball Retention Under Low Pressure', weight: 1 },
          { id: 'passCompletionLow', label: 'Pass Completion Under Low Pressure', weight: 1 },
          { id: 'dangerousPassHigh', label: 'Dangerous Pass Completion Under High Pressure', weight: 1 },
          { id: 'difficultPassHigh', label: 'Difficult Pass Completion Under High Pressure', weight: 1 }
        ]
      },
      {
        name: 'Defensive Actions',
        weight: 3,
        metrics: [
          { id: 'onBallEngagementsOTIP', label: 'On-Ball Engagements OTIP', weight: 2 },
          { id: 'onBallEngagementsInHighBlock', label: 'On-Ball Engagements in High Block', weight: 1 },
          { id: 'onBallEngagementsInMediumBlock', label: 'On-Ball Engagements in Medium Block', weight: 1 },
          { id: 'onBallEngagementsInLowBlock', label: 'On-Ball Engagements in Low Block', weight: 1 },
          { id: 'beatenByMovement', label: 'Beaten by Movement', weight: 2 },
          { id: 'beatenByPossession', label: 'Beaten By Possession', weight: 2 },
          { id: 'forceBackward', label: 'Force Backward per 30 OTIP', weight: 1 },
          { id: 'regains', label: 'Regains per 30 OTIP', weight: 1 },
        ]
      }
    ]
  },

  'technical_centre_back': {
    name: 'Technical Centre Back',
    sections: [
      {
        name: 'Physical Metrics',
        weight: 2,
        metrics: [
          { id: 'maxSpeed', label: 'Max Speed', weight: 1 },
          { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 1 },
          { id: 'mediumAccelCount', label: 'Medium Acceleration Count', weight: 1 },
          { id: 'highAccelCount', label: 'High Acceleration Count', weight: 1 },
          { id: 'sprintCount', label: 'Sprint Count', weight: 2 }
        ]
      },
      {
        name: 'Movement',
        weight: 1,
        metrics: [
          { id: 'droppingOffRuns', label: 'Dropping Off Runs', weight: 1 },
          { id: 'pullingWideRuns', label: 'Pulling Wide Runs', weight: 2 },
          { id: 'comingShort', label: 'Coming Short', weight: 2 },
          { id: 'supportRuns', label: 'Support Runs', weight: 1 }
        ]
      },
      {
        name: 'Passing Metrics',
        weight: 3,
        metrics: [
          { id: 'passAttemptsComingShort', label: 'Pass Attempts Coming Short', weight: 2 },
          { id: 'passCompletionComingShort', label: 'Pass Completion Coming Short', weight: 2 },
          { id: 'passAttemptsRunsAhead', label: 'Pass Attempts Runs Ahead', weight: 2 },
          { id: 'passCompletionRunsAhead', label: 'Pass Completion Runs Ahead', weight: 2 }
        ]
      },
      {
        name: 'Pressure Handling',
        weight: 1,
        metrics: [
          { id: 'ballRetentionHigh', label: 'Ball Retention Under High Pressure', weight: 2 },
          { id: 'passCompletionHigh', label: 'Pass Completion Under High Pressure', weight: 2 },
          { id: 'ballRetentionMedium', label: 'Ball Retention Under Medium Pressure', weight: 1 },
          { id: 'passCompletionMedium', label: 'Pass Completion Under Medium Pressure', weight: 1 },
          { id: 'ballRetentionLow', label: 'Ball Retention Under Low Pressure', weight: 2 },
          { id: 'passCompletionLow', label: 'Pass Completion Under Low Pressure', weight: 2 },
          { id: 'dangerousPassHigh', label: 'Dangerous Pass Completion Under High Pressure', weight: 1 }
        ]
      },
      {
        name: 'Defensive Actions',
        weight: 3,
        metrics: [
          { id: 'onBallEngagementsOTIP', label: 'On-Ball Engagements OTIP', weight: 2 },
          { id: 'onBallEngagementsInHighBlock', label: 'On-Ball Engagements in High Block', weight: 1 },
          { id: 'onBallEngagementsInMediumBlock', label: 'On-Ball Engagements in Medium Block', weight: 1 },
          { id: 'onBallEngagementsInLowBlock', label: 'On-Ball Engagements in Low Block', weight: 1 },
          { id: 'beatenByMovement', label: 'Beaten by Movement', weight: 2 },
          { id: 'beatenByPossession', label: 'Beaten By Possession', weight: 2 },
          { id: 'forceBackward', label: 'Force Backward per 30 OTIP', weight: 1 },
          { id: 'regains', label: 'Regains per 30 OTIP', weight: 1 },
        ]
      }
    ]
  },

  'pivot': {
    name: 'Pivot',
    sections: [
      {
        name: 'Physical Metrics',
        weight: 1,
        metrics: [
          { id: 'maxSpeed', label: 'Max Speed', weight: 1 },
          { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 1 },
          { id: 'timeToSprintTop3', label: 'Time to Sprint Top 3', weight: 1 },
          { id: 'timeToHsrTop3', label: 'Time to HSR Top 3', weight: 1 },
          { id: 'sprintCount', label: 'Sprint Count', weight: 2 }
        ]
      },
      {
        name: 'Movement',
        weight: 1,
        metrics: [
          { id: 'comingShort', label: 'Coming Short', weight: 2 },
          { id: 'droppingOffRuns', label: 'Dropping Off Runs', weight: 1 },
          { id: 'pullingWideRuns', label: 'Pulling Wide Runs', weight: 1 },
          { id: 'supportRuns', label: 'Support Runs', weight: 1 }
        ]
      },
      {
        name: 'Passing Metrics',
        weight: 3,
        metrics: [
          { id: 'passAttemptsToRuns', label: 'Pass Attempts to Player Making a Run', weight: 2 },
          { id: 'passCompletionToRuns', label: 'Pass Completion to Player Making a Run', weight: 1 },
          { id: 'passAttemptsRunsAhead', label: 'Pass Attempts Runs Ahead', weight: 2 },
          { id: 'passAttemptsToHalfSpace', label: 'Pass Attempts to Half Space', weight: 1 },
          { id: 'passCompletionToHalfSpace', label: 'Pass Completion to Half Space', weight: 1 },
          { id: 'passCompletionRunsAhead', label: 'Pass Completion Runs Ahead', weight: 1 },
          { id: 'passAttemptsComingShort', label: 'Pass Attempts Coming Short', weight: 2 },
          { id: 'passCompletionComingShort', label: 'Pass Completion Coming Short', weight: 1 }
        ]
      },
      {
        name: 'Pressure Handling',
        weight: 3,
        metrics: [
          { id: 'ballRetentionHigh', label: 'Ball Retention Under High Pressure', weight: 2 },
          { id: 'ballRetentionMedium', label: 'Ball Retention Under Medium Pressure', weight: 2 },
          { id: 'passCompletionHigh', label: 'Pass Completion Under High Pressure', weight: 1 },
          { id: 'passCompletionMedium', label: 'Pass Completion Under Medium Pressure', weight: 1 },
          { id: 'passCompletionLow', label: 'Pass Completion Under Low Pressure', weight: 1 },
          { id: 'dangerousPassHigh', label: 'Dangerous Pass Completion Under High Pressure', weight: 1 },
          { id: 'difficultPassHigh', label: 'Difficult Pass Completion Under High Pressure', weight: 1 }
        ]
      },
      {
        name: 'Defensive Actions',
        weight: 2,
        metrics: [
          { id: 'onBallEngagementsOTIP', label: 'On-Ball Engagements OTIP', weight: 2 },
          { id: 'onBallEngagementsInHighBlock', label: 'On-Ball Engagements in High Block', weight: 1 },
          { id: 'onBallEngagementsInMediumBlock', label: 'On-Ball Engagements in Medium Block', weight: 1 },
          { id: 'onBallEngagementsInLowBlock', label: 'On-Ball Engagements in Low Block', weight: 1 },
          { id: 'recoveryPressingEngagements', label: 'Recovery Pressing Engagements', weight: 1 },
          { id: 'pressureEngagements', label: 'Pressure Engagements', weight: 1 },
          { id: 'pressingEngagements', label: 'Pressing Engagements', weight: 1 },
          { id: 'beatenByMovement', label: 'Beaten by Movement', weight: 2 },
          { id: 'beatenByPossession', label: 'Beaten By Possession', weight: 2 },
          { id: 'forceBackward', label: 'Force Backward per 30 OTIP', weight: 1 },
          { id: 'regains', label: 'Regains per 30 OTIP', weight: 1 },
        ]
      }
    ]
  },

  'box_to_box': {
    name: 'Box to Box Midfielder',
    emoji: '🔥',
    sections: [
      {
        name: 'Physical Metrics',
        weight: 3,
        metrics: [
          { id: 'maxSpeed', label: 'Max Speed', weight: 1 },
          { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 2 },
          { id: 'HiDistance', label: 'High Intensity Distance per 90min', weight: 2 },
          { id: 'explosiveAccelSprint', label: 'Explosive Acceleration to Sprint (P90)', weight: 1 },
          { id: 'explosiveAccelHsr', label: 'Explosive Acceleration to HSR (P90)', weight: 1 },
          { id: 'metersPerMinuteTIP', label: 'Meters Per Minute per 90min (TIP)', weight: 2 },
          { id: 'sprintCount', label: 'Sprint Count', weight: 2 }
        ]
      },
      {
        name: 'Movement',
        weight: 2,
        metrics: [
          { id: 'supportRuns', label: 'Support Runs', weight: 2 },
          { id: 'runsMakingBoxReceivable', label: 'Runs Making Box Receivable', weight: 2 },
          { id: 'runsMakingBoxReceivableThreat', label: 'Runs Making Box Receivable Threat', weight: 1 },
          { id: 'runsAhead', label: 'Runs Ahead', weight: 1 },
          { id: 'runsAheadThreat', label: 'Runs Ahead Threat', weight: 1 },
          { id: 'halfSpaceRuns', label: 'Half Space Runs', weight: 1 },
          { id: 'halfSpaceRunsThreat', label: 'Half Space Runs Threat', weight: 1 }
        ]
      },
      {
        name: 'Passing Metrics',
        weight: 2,
        metrics: [
          { id: 'passAttemptsToRuns', label: 'Pass Attempts to Player Making a Run', weight: 2 },
          { id: 'passCompletionToRuns', label: 'Pass Completion to Player Making a Run', weight: 1 },
          { id: 'passAttemptsRunsAhead', label: 'Pass Attempts Runs Ahead', weight: 2 },
          { id: 'passCompletionRunsAhead', label: 'Pass Completion Runs Ahead', weight: 1 },
          { id: 'passAttemptsToHalfSpace', label: 'Pass Attempts to Half Space', weight: 1 },
          { id: 'passCompletionToHalfSpace', label: 'Pass Completion to Half Space', weight: 1 }
        ]
      },
      {
        name: 'Pressure Handling',
        weight: 2,
        metrics: [
          { id: 'ballRetentionHigh', label: 'Ball Retention Under High Pressure', weight: 2 },
          { id: 'passCompletionHigh', label: 'Pass Completion Under High Pressure', weight: 2 },
          { id: 'ballRetentionMedium', label: 'Ball Retention Under Medium Pressure', weight: 2 },
          { id: 'passCompletionMedium', label: 'Pass Completion Under Medium Pressure', weight: 2 },
          { id: 'dangerousPassHigh', label: 'Dangerous Pass Completion Under High Pressure', weight: 2 },
          { id: 'difficultPassHigh', label: 'Difficult Pass Completion Under High Pressure', weight: 2 }
        ]
      },
      {
        name: 'Defensive Actions',
        weight: 1,
        metrics: [
          { id: 'onBallEngagementsOTIP', label: 'On-Ball Engagements OTIP', weight: 1 },
          { id: 'recoveryPressingEngagements', label: 'Recovery Pressing Engagements', weight: 1 },
          { id: 'counterPressingEngagements', label: 'Counter Pressing Engagements', weight: 2 },
          { id: 'pressureEngagements', label: 'Pressure Engagements', weight: 2 },
          { id: 'pressingEngagements', label: 'Pressing Engagements', weight: 2 },
          { id: 'forceBackward', label: 'Force Backward per 30 OTIP', weight: 2 },
          { id: 'regains', label: 'Regains per 30 OTIP', weight: 1 },
        ]
      }
    ]
  },

  'traditional_winger': {
    name: 'Traditional Winger',
    emoji: '⚡',
    sections: [
      {
        name: 'Physical Metrics',
        weight: 3,
        metrics: [
          { id: 'maxSpeed', label: 'Max Speed', weight: 2 },
          { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 2 },
          { id: 'timeToSprintTop3', label: 'Time to Sprint Top 3', weight: 2 },
          { id: 'timeToHsrTop3', label: 'Time to HSR Top 3', weight: 1 },
          { id: 'explosiveAccelSprint', label: 'Explosive Acceleration to Sprint (P90)', weight: 1 },
          { id: 'explosiveAccelHsr', label: 'Explosive Acceleration to HSR (P90)', weight: 1 },
          { id: 'sprintCount', label: 'Sprint Count', weight: 2 },
          { id: 'HiDistance', label: 'High Intensity Distance per 90min', weight: 1 }
        ]
      },
      {
        name: 'Movement',
        weight: 3,
        metrics: [
          { id: 'pullingWideRuns', label: 'Pulling Wide Runs', weight: 2 },
          { id: 'pullingWideRunsThreat', label: 'Pulling Wide Runs Threat', weight: 1 },
          { id: 'runsInBehind', label: 'Runs in Behind', weight: 2 },
          { id: 'runsInBehindThreat', label: 'Runs in Behind Threat', weight: 1 },
          { id: 'runsAhead', label: 'Runs Ahead', weight: 1 },
          { id: 'runsAheadThreat', label: 'Runs Ahead Threat', weight: 1 }
        ]
      },
      {
        name: 'Passing Metrics',
        weight: 1,
        metrics: [
          { id: 'passAttemptsCross', label: 'Pass Attempts Cross Receiver', weight: 2 },
          { id: 'passCompletionCross', label: 'Pass Completion Cross Receiver', weight: 2 },
          { id: 'passAttemptsRunsInBehind', label: 'Pass Attempts Runs In Behind', weight: 1 },
          { id: 'passCompletionRunsInBehind', label: 'Pass Completion Runs In Behind', weight: 1 }
        ]
      },
      {
        name: 'Pressure Handling',
        weight: 1,
        metrics: [
          { id: 'ballRetentionHigh', label: 'Ball Retention Under High Pressure', weight: 1 },
          { id: 'passCompletionHigh', label: 'Pass Completion Under High Pressure', weight: 1 },
          { id: 'ballRetentionMedium', label: 'Ball Retention Under Medium Pressure', weight: 1 },
          { id: 'passCompletionMedium', label: 'Pass Completion Under Medium Pressure', weight: 1 },
          { id: 'dangerousPassHigh', label: 'Dangerous Pass Completion Under High Pressure', weight: 1 },
          { id: 'difficultPassHigh', label: 'Difficult Pass Completion Under High Pressure', weight: 1 }
        ]
      },
      {
        name: 'Defensive Actions',
        weight: 2,
        metrics: [
          { id: 'onBallEngagementsOTIP', label: 'On-Ball Engagements OTIP', weight: 2 },
          { id: 'counterPressingEngagements', label: 'Counter Pressing Engagements', weight: 1 },
          { id: 'pressingEngagements', label: 'Pressing Engagements', weight: 1 },
          { id: 'pressureEngagements', label: 'Pressure Engagements', weight: 1 },
          { id: 'forceBackward', label: 'Force Backward per 30 OTIP', weight: 1 },
          { id: 'regains', label: 'Regains per 30 OTIP', weight: 1 },
        ]
      }
    ]
  },

  'inverted_winger': {
    name: 'Inverted Winger',
    emoji: '🎯',
    sections: [
      {
        name: 'Physical Metrics',
        weight: 2,
        metrics: [
          { id: 'maxSpeed', label: 'Max Speed', weight: 1 },
          { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 1 },
          { id: 'explosiveAccelSprint', label: 'Explosive Acceleration to Sprint (P90)', weight: 1 },
          { id: 'explosiveAccelHsr', label: 'Explosive Acceleration to HSR (P90)', weight: 1 },
          { id: 'sprintCount', label: 'Sprint Count', weight: 2 },
          { id: 'HiDistance', label: 'High Intensity Distance per 90min', weight: 1 }
        ]
      },
      {
        name: 'Movement',
        weight: 2,
        metrics: [
          { id: 'halfSpaceRuns', label: 'Half Space Runs', weight: 2 },
          { id: 'halfSpaceRunsThreat', label: 'Half Space Runs Threat', weight: 1 },
          { id: 'runsInBehind', label: 'Runs in Behind', weight: 1 },
          { id: 'runsInBehindThreat', label: 'Runs in Behind Threat', weight: 1 },
          { id: 'runsAhead', label: 'Runs Ahead', weight: 1 },
          { id: 'runsAheadThreat', label: 'Runs Ahead Threat', weight: 1 }
        ]
      },
      {
        name: 'Passing Metrics',
        weight: 3,
        metrics: [
          { id: 'passAttemptsToRuns', label: 'Pass Attempts to Player Making a Run', weight: 2 },
          { id: 'passCompletionToRuns', label: 'Pass Completion to Player Making a Run', weight: 1 },
          { id: 'passAttemptsToHalfSpace', label: 'Pass Attempts to Half Space', weight: 2 },
          { id: 'passCompletionToHalfSpace', label: 'Pass Completion to Half Space', weight: 1 },
          { id: 'passAttemptsRunsInBehind', label: 'Pass Attempts Runs In Behind', weight: 2 },
          { id: 'passCompletionRunsInBehind', label: 'Pass Completion Runs In Behind', weight: 1 }
        ]
      },
      {
        name: 'Pressure Handling',
        weight: 2,
        metrics: [
          { id: 'ballRetentionHigh', label: 'Ball Retention Under High Pressure', weight: 2 },
          { id: 'passCompletionHigh', label: 'Pass Completion Under High Pressure', weight: 2 },
          { id: 'ballRetentionMedium', label: 'Ball Retention Under Medium Pressure', weight: 1 },
          { id: 'passCompletionMedium', label: 'Pass Completion Under Medium Pressure', weight: 1 },
          { id: 'dangerousPassHigh', label: 'Dangerous Pass Completion Under High Pressure', weight: 2 },
          { id: 'difficultPassHigh', label: 'Difficult Pass Completion Under High Pressure', weight: 2 }
        ]
      },
      {
        name: 'Defensive Actions',
        weight: 1,
        metrics: [
          { id: 'onBallEngagementsOTIP', label: 'On-Ball Engagements OTIP', weight: 1 },
          { id: 'counterPressingEngagements', label: 'Counter Pressing Engagements', weight: 2 },
          { id: 'pressingEngagements', label: 'Pressing Engagements', weight: 2 },
          { id: 'pressureEngagements', label: 'Pressure Engagements', weight: 2 },
          { id: 'forceBackward', label: 'Force Backward per 30 OTIP', weight: 1 },
          { id: 'regains', label: 'Regains per 30 OTIP', weight: 1 },
        ]
      }
    ]
  },

  'direct_striker': {
    name: 'Direct Striker',
    emoji: '🎯',
    sections: [
      {
        name: 'Physical Metrics',
        weight: 3,
        metrics: [
          { id: 'maxSpeed', label: 'Max Speed', weight: 2 },
          { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 2 },
          { id: 'timeToSprintTop3', label: 'Time to Sprint Top 3', weight: 1 },
          { id: 'timeToHsrTop3', label: 'Time to HSR Top 3', weight: 1 },
          { id: 'explosiveAccelSprint', label: 'Explosive Acceleration to Sprint (P90)', weight: 1 },
          { id: 'explosiveAccelHsr', label: 'Explosive Acceleration to HSR (P90)', weight: 1 },
          { id: 'sprintCount', label: 'Sprint Count', weight: 2 }
        ]
      },
      {
        name: 'Movement',
        weight: 3,
        metrics: [
          { id: 'runsInBehind', label: 'Runs in Behind', weight: 2 },
          { id: 'runsInBehindThreat', label: 'Runs in Behind Threat', weight: 2 },
          { id: 'pullingWideRuns', label: 'Pulling Wide Runs', weight: 1 },
          { id: 'pullingWideRunsThreat', label: 'Pulling Wide Runs Threat', weight: 1 },
          { id: 'halfSpaceRuns', label: 'Half Space Runs', weight: 1 },
          { id: 'halfSpaceRunsThreat', label: 'Half Space Runs Threat', weight: 1 }
        ]
      },
      {
        name: 'Passing Metrics',
        weight: 1,
        metrics: [
          { id: 'passAttemptsToRuns', label: 'Pass Attempts to Player Making a Run', weight: 1 },
          { id: 'passCompletionToRuns', label: 'Pass Completion to Player Making a Run', weight: 1 },
          { id: 'passAttemptsRunsAhead', label: 'Pass Attempts Runs Ahead', weight: 1 },
          { id: 'passCompletionRunsAhead', label: 'Pass Completion Runs Ahead', weight: 1 }
        ]
      },
      {
        name: 'Pressure Handling',
        weight: 1,
        metrics: [
          { id: 'ballRetentionHigh', label: 'Ball Retention Under High Pressure', weight: 1 },
          { id: 'passCompletionHigh', label: 'Pass Completion Under High Pressure', weight: 1 },
          { id: 'ballRetentionMedium', label: 'Ball Retention Under Medium Pressure', weight: 1 },
          { id: 'passCompletionMedium', label: 'Pass Completion Under Medium Pressure', weight: 1 }
        ]
      },
      {
        name: 'Defensive Actions',
        weight: 2,
        metrics: [
          { id: 'counterPressingEngagements', label: 'Counter Pressing Engagements', weight: 2 },
          { id: 'pressingEngagements', label: 'Pressing Engagements', weight: 2 },
          { id: 'pressureEngagements', label: 'Pressure Engagements', weight: 2 }
        ]
      }
    ]
  },

  'second_striker': {
    name: 'Second Striker',
    emoji: '⚡',
    sections: [
      {
        name: 'Physical Metrics',
        weight: 2,
        metrics: [
          { id: 'maxSpeed', label: 'Max Speed', weight: 1 },
          { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 1 },
          { id: 'explosiveAccelSprint', label: 'Explosive Acceleration to Sprint (P90)', weight: 1 },
          { id: 'explosiveAccelHsr', label: 'Explosive Acceleration to HSR (P90)', weight: 1 },
          { id: 'sprintCount', label: 'Sprint Count', weight: 2 },
          { id: 'HiDistance', label: 'High Intensity Distance per 90min', weight: 1 }
        ]
      },
      {
        name: 'Movement',
        weight: 2,
        metrics: [
          { id: 'droppingOffRuns', label: 'Dropping Off Runs', weight: 2 },
          { id: 'halfSpaceRuns', label: 'Half Space Runs', weight: 2 },
          { id: 'halfSpaceRunsThreat', label: 'Half Space Runs Threat', weight: 1 },
          { id: 'runsInBehind', label: 'Runs in Behind', weight: 1 },
          { id: 'runsInBehindThreat', label: 'Runs in Behind Threat', weight: 1 },
          { id: 'runsAhead', label: 'Runs Ahead', weight: 1 },
          { id: 'runsAheadThreat', label: 'Runs Ahead Threat', weight: 1 }
        ]
      },
      {
        name: 'Passing Metrics',
        weight: 2,
        metrics: [
          { id: 'passAttemptsOverlaps', label: 'Pass Attempts Overlaps', weight: 2 },
          { id: 'passCompletionOverlaps', label: 'Pass Completion Overlaps', weight: 1 },
          { id: 'passAttemptsRunsInBehind', label: 'Pass Attempts Runs In Behind', weight: 2 },
          { id: 'passCompletionRunsInBehind', label: 'Pass Completion Runs In Behind', weight: 1 },
          { id: 'passAttemptsToRuns', label: 'Pass Attempts to Player Making a Run', weight: 2 },
          { id: 'passCompletionToRuns', label: 'Pass Completion to Player Making a Run', weight: 1 }
        ]
      },
      {
        name: 'Pressure Handling',
        weight: 2,
        metrics: [
          { id: 'ballRetentionHigh', label: 'Ball Retention Under High Pressure', weight: 2 },
          { id: 'passCompletionHigh', label: 'Pass Completion Under High Pressure', weight: 2 },
          { id: 'ballRetentionMedium', label: 'Ball Retention Under Medium Pressure', weight: 2 },
          { id: 'passCompletionMedium', label: 'Pass Completion Under Medium Pressure', weight: 2 },
          { id: 'dangerousPassHigh', label: 'Dangerous Pass Completion Under High Pressure', weight: 2 },
          { id: 'difficultPassHigh', label: 'Difficult Pass Completion Under High Pressure', weight: 2 }
        ]
      },
      {
        name: 'Defensive Actions',
        weight: 2,
        metrics: [
          { id: 'onBallEngagementsOTIP', label: 'On-Ball Engagements OTIP', weight: 1 },
          { id: 'recoveryPressingEngagements', label: 'Recovery Pressing Engagements', weight: 1 },
          { id: 'counterPressingEngagements', label: 'Counter Pressing Engagements', weight: 2 },
          { id: 'pressureEngagements', label: 'Pressure Engagements', weight: 2 },
          { id: 'pressingEngagements', label: 'Pressing Engagements', weight: 2 },
          { id: 'forceBackward', label: 'Force Backward per 30 OTIP', weight: 2 },
          { id: 'regains', label: 'Regains per 30 OTIP', weight: 1 },
        ]
      }
    ]
  }
};

// Calculate rating for a specific section
export function calculateSectionRating(
  section: Section,
  metricValues: Record<string, number>
): number {
  let weightedSum = 0;
  let totalWeight = 0;

  section.metrics.forEach(metric => {
    const value = metricValues[metric.id];
    if (value !== undefined && value !== null && !isNaN(value)) {
      weightedSum += value * metric.weight;
      totalWeight += metric.weight;
    }
  });

  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

// Calculate overall rating for a profile
export function calculateProfileRatings(
  profile: Profile,
  metricValues: Record<string, number>
): {
  overall: number;
  physical: number;
  movement: number;
  passing: number;
  pressure: number;
  defensive: number;
} {
  const sectionRatings: Record<string, number> = {};
  let overallWeightedSum = 0;
  let overallTotalWeight = 0;

  // Calculate each section rating
  profile.sections.forEach(section => {
    const sectionRating = calculateSectionRating(section, metricValues);
    sectionRatings[section.name] = sectionRating;
    
    // Add to overall calculation
    overallWeightedSum += sectionRating * section.weight;
    overallTotalWeight += section.weight;
  });

  const overall = overallTotalWeight > 0 ? overallWeightedSum / overallTotalWeight : 0;

  return {
    overall: Math.round(overall * 10) / 10, // Round to 1 decimal
    physical: Math.round((sectionRatings['Physical Metrics'] || 0) * 10) / 10,
    movement: Math.round((sectionRatings['Movement'] || 0) * 10) / 10,
    passing: Math.round((sectionRatings['Passing Metrics'] || 0) * 10) / 10,
    pressure: Math.round((sectionRatings['Pressure Handling'] || 0) * 10) / 10,
    defensive: Math.round((sectionRatings['Defensive Actions'] || 0) * 10) / 10,
  };
}

// Get available profiles for a position
export function getProfilesForPosition(position: string): string[] {
  const groupKey = POSITION_TO_GROUP[position];
  if (!groupKey) return [];
  
  const group = POSITION_GROUPS[groupKey];
  return group ? group.profiles : [];
}

// Get all unique metrics needed for a position (union of all profile metrics)
export function getMetricsForPosition(position: string): Metric[] {
  const profiles = getProfilesForPosition(position);
  const metricsMap = new Map<string, Metric>();

  profiles.forEach(profileKey => {
    const profile = PROFILES[profileKey];
    if (profile) {
      profile.sections.forEach(section => {
        section.metrics.forEach(metric => {
          if (!metricsMap.has(metric.id)) {
            metricsMap.set(metric.id, metric);
          }
        });
      });
    }
  });

  return Array.from(metricsMap.values());
}

// Map profile keys to SubProfile type values
export const PROFILE_KEY_TO_SUBPROFILE: Record<string, string> = {
  'intense_fullback': 'Intense Fullback',
  'technical_fullback': 'Technical Fullback',
  'physical_centre_back': 'Physical Centre Back',
  'technical_centre_back': 'Technical Centre Back',
  'pivot': 'Pivot',
  'box_to_box': 'Box-to-Box',
  'traditional_winger': 'Traditional Winger',
  'inverted_winger': 'Inverted Winger',
  'direct_striker': 'Direct Striker',
  'second_striker': 'Second Striker',
};
