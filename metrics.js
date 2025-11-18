// Player Rating Calculator - Profile Configuration
// ===============================================
// 
// Edit this file to add or modify position profiles.
// After saving, just refresh calculator.html in your browser.

// Position Groups - Enter metrics once, get ratings for multiple profiles
const POSITION_GROUPS = {
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

const PROFILES = {
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
                    { id: 'metersPerMinuteOTIP', label: 'Meters Per Minute per 90min (OTIP)', weight: 2 }
                ]
            },
            {
                name: 'Movement',
                weight: 3,
                metrics: [
                    { id: 'runsInBehind', label: 'Runs in Behind', weight: 1 },
                    { id: 'runsInBehindThreat', label: 'Runs in Behind Threat', weight: 1 },
                    { id: 'runsAhead', label: 'Runs Ahead', weight: 2 },
                    { id: 'runsAheadThreat', label: 'Runs Ahead Threat', weight: 1 },
                    { id: 'crossReceiverRuns', label: 'Cross Receiver Runs', weight: 2 },
                    { id: 'crossReceiverRunsThreat', label: 'Cross Receiver Runs Threat', weight: 1 },
                    { id: 'dangerousRuns', label: 'Dangerous Runs', weight: 2 },
                    { id: 'runsLeadingToShot', label: 'Runs Leading to Shot', weight: 2 }
                ]
            },
            {
                name: 'Passing Metrics',
                weight: 1,
                metrics: [
                    { id: 'passAttemptsRunsInBehind', label: 'Pass Attempts Runs In Behind', weight: 1 },
                    { id: 'passCompletionRunsInBehind', label: 'Pass Completion Runs In Behind', weight: 1 },
                    { id: 'passAttemptsRunsAhead', label: 'Pass Attempts Runs Ahead', weight: 1 },
                    { id: 'passCompletionRunsAhead', label: 'Pass Completion Runs Ahead', weight: 1 },
                    { id: 'passAttemptsCross', label: 'Pass Attempts Cross Receiver', weight: 1 },
                    { id: 'passCompletionCross', label: 'Pass Completion Cross Receiver', weight: 1 },
                    { id: 'passAttemptsToRuns', label: 'Pass Attempts to Player Making a Run', weight: 2 },
                ]
            },
            {
                name: 'Pressure Handling',
                weight: 1,
                metrics: [
                    { id: 'ballRetentionHigh', label: 'Ball Retention Under High Pressure', weight: 2 },
                    { id: 'passCompletionHigh', label: 'Pass Completion Under High Pressure', weight: 1 },
                    { id: 'ballRetentionMedium', label: 'Ball Retention Under Medium Pressure', weight: 2 },
                    { id: 'passCompletionMedium', label: 'Pass Completion Under Medium Pressure', weight: 1 },
                    { id: 'ballRetentionLow', label: 'Ball Retention Under Low Pressure', weight: 2 },
                    { id: 'passCompletionLow', label: 'Pass Completion Under Low Pressure', weight: 1 },
                    { id: 'dangerousPassHigh', label: 'Dangerous Pass Completion Under High Pressure', weight: 2 },
                    { id: 'difficultPassHigh', label: 'Difficult Pass Completion Under High Pressure', weight: 2 }
                ]
            },
            {
                name: 'Defensive Actions',
                weight: 2,
                metrics: [
                    { id: 'onBallEngagementsOTIP', label: 'On-Ball Engagements OTIP', weight: 2 },
                    { id: 'recoveryPressingEngagements', label: 'Recovery Pressing Engagements', weight: 1 },
                    { id: 'counterPressingEngagements', label: 'Counter Pressing Engagements', weight: 2 },
                    { id: 'pressureEngagements', label: 'Pressure Engagements', weight: 2 },
                    { id: 'pressingEngagements', label: 'Pressing Engagements', weight: 2 },
                    { id: 'beatenByMovement', label: 'Beaten by Movement', weight: 1 },
                    { id: 'beatenByPossession', label: 'Beaten By Possession', weight: 1 },
                    { id: 'forceBackward', label: 'Force Backward per 30 OTIP', weight: 2 },
                    { id: 'regains', label: 'Regains per 30 OTIP', weight: 1 },
                ]
            }
        ]
    },

    'traditional_winger': {
        name: 'Traditional Winger',
        sections: [
            {
                name: 'Physical Metrics',
                weight: 3,
                metrics: [
                    { id: 'maxSpeed', label: 'Max Speed', weight: 2 },
                    { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 2 },
                    { id: 'timeToSprintTop3', label: 'Time to Sprint Top 3', weight: 2 },
                    { id: 'timeToHsrTop3', label: 'Time to HSR Top 3', weight: 2 },
                    { id: 'explosiveAccelSprint', label: 'Explosive Acceleration to Sprint (P90)', weight: 2 },
                    { id: 'explosiveAccelHsr', label: 'Explosive Acceleration to HSR (P90)', weight: 2 },
                    { id: 'HIDistance', label: 'High Intensity Distance per 90min', weight: 1 },
                    { id: 'sprintCount', label: 'Sprint Count', weight: 2 }
                ]
            },
            {
                name: 'Movement',
                weight: 3,
                metrics: [
                    { id: 'overlaps', label: 'Overlaps', weight: 1 },
                    { id: 'overlapsThreat', label: 'Overlaps Threat', weight: 1 },
                    { id: 'underlaps', label: 'Underlaps', weight: 1 },
                    { id: 'underlapsThreat', label: 'Underlaps Threat', weight: 1 },
                    { id: 'runsInBehind', label: 'Runs in Behind', weight: 2 },
                    { id: 'runsInBehindThreat', label: 'Runs in Behind Threat', weight: 2 },
                    { id: 'runsAhead', label: 'Runs Ahead', weight: 2 },
                    { id: 'runsAheadThreat', label: 'Runs Ahead Threat', weight: 2 }
                ]
            },
            {
                name: 'Passing Metrics',
                weight: 1,
                metrics: [
                    { id: 'passAttemptsOverlaps', label: 'Pass Attempts Overlaps', weight: 1 },
                    { id: 'passCompletionOverlaps', label: 'Pass Completion Overlaps', weight: 1 },
                    { id: 'passAttemptsUnderlaps', label: 'Pass Attempts Underlaps', weight: 1 },
                    { id: 'passCompletionUnderlaps', label: 'Pass Completion Underlaps', weight: 1 },
                    { id: 'passAttemptsCross', label: 'Pass Attempts Cross Receiver', weight: 2 },
                    { id: 'passCompletionCross', label: 'Pass Completion Cross Receiver', weight: 2 }
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
                    { id: 'ballRetentionLow', label: 'Ball Retention Under Low Pressure', weight: 1 },
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
                    { id: 'recoveryPressingEngagements', label: 'Recovery Pressing Engagements', weight: 2 },
                    { id: 'counterPressingEngagements', label: 'Counter Pressing Engagements', weight: 2 },
                    { id: 'pressureEngagements', label: 'Pressure Engagements', weight: 2 },
                    { id: 'pressingEngagements', label: 'Pressing Engagements', weight: 1 },
                    { id: 'forceBackward', label: 'Force Backward per 30 OTIP', weight: 1 },
                    { id: 'regains', label: 'Regains per 30 OTIP', weight: 1 },
                ]
            }
        ]
    },

    'inverted_winger': {
        name: 'Inverted Winger',
        sections: [
            {
                name: 'Physical Metrics',
                weight: 2,
                metrics: [
                    { id: 'maxSpeed', label: 'Max Speed', weight: 1 },
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
                weight: 1,
                metrics: [
                    { id: 'comingShort', label: 'Coming Short', weight: 1 },
                    { id: 'pullingHalfSpace', label: 'Pulling Half Space', weight: 2 },
                    { id: 'runsAhead', label: 'Runs Ahead', weight: 1 },
                    { id: 'runsAheadThreat', label: 'Runs Ahead Threat', weight: 1 },
                    { id: 'runsInBehind', label: 'Runs in Behind', weight: 2 },
                    { id: 'runsInBehindThreat', label: 'Runs in Behind Threat', weight: 1 }
                ]
            },
            {
                name: 'Passing Metrics',
                weight: 3,
                metrics: [
                    { id: 'passAttemptsRunsInBehind', label: 'Pass Attempts Runs In Behind', weight: 2 },
                    { id: 'passCompletionRunsInBehind', label: 'Pass Completion Runs In Behind', weight: 2 },
                    { id: 'passAttemptsRunsAhead', label: 'Pass Attempts Runs Ahead', weight: 2 },
                    { id: 'passCompletionRunsAhead', label: 'Pass Completion Runs Ahead', weight: 2 },
                    { id: 'passAttemptsCross', label: 'Pass Attempts Cross Receiver', weight: 1 },
                    { id: 'passCompletionCross', label: 'Pass Completion Cross Receiver', weight: 1 }
                ]
            },
            {
                name: 'Pressure Handling',
                weight: 3,
                metrics: [
                    { id: 'ballRetentionHigh', label: 'Ball Retention Under High Pressure', weight: 2 },
                    { id: 'passCompletionHigh', label: 'Pass Completion Under High Pressure', weight: 2 },
                    { id: 'ballRetentionMedium', label: 'Ball Retention Under Medium Pressure', weight: 1 },
                    { id: 'passCompletionMedium', label: 'Pass Completion Under Medium Pressure', weight: 1 },
                    { id: 'ballRetentionLow', label: 'Ball Retention Under Low Pressure', weight: 1 },
                    { id: 'passCompletionLow', label: 'Pass Completion Under Low Pressure', weight: 1 },
                    { id: 'dangerousPassAttemptsHigh', label: 'Dangerous Pass Attempts Under High Pressure', weight: 2 },
                    { id: 'dangerousPassHigh', label: 'Dangerous Pass Completion Under High Pressure', weight: 2 },
                    { id: 'difficultPassHigh', label: 'Difficult Pass Completion Under High Pressure', weight: 2 }
                ]
            },
            {
                name: 'Defensive Actions',
                weight: 1,
                metrics: [
                    { id: 'onBallEngagementsOTIP', label: 'On-Ball Engagements OTIP', weight: 2 },
                    { id: 'recoveryPressingEngagements', label: 'Recovery Pressing Engagements', weight: 2 },
                    { id: 'counterPressingEngagements', label: 'Counter Pressing Engagements', weight: 2 },
                    { id: 'pressureEngagements', label: 'Pressure Engagements', weight: 2 },
                    { id: 'pressingEngagements', label: 'Pressing Engagements', weight: 1 },
                    { id: 'forceBackward', label: 'Force Backward per 30 OTIP', weight: 1 },
                    { id: 'regains', label: 'Regains per 30 OTIP', weight: 1 },
                ]
            }
        ]
    },

    'direct_striker': {
        name: 'Direct Striker',
        emoji: '⚡',
        sections: [
            {
                name: 'Physical Metrics',
                weight: 3,
                metrics: [
                    { id: 'maxSpeed', label: 'Max Speed', weight: 2 },
                    { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 2 },
                    { id: 'timeToSprintTop3', label: 'Time to Sprint Top 3', weight: 1 },
                    { id: 'timeToHsrTop3', label: 'Time to HSR Top 3', weight: 1 },
                    { id: 'explosiveAccelSprint', label: 'Explosive Acceleration to Sprint (P90)', weight: 2 },
                    { id: 'explosiveAccelHsr', label: 'Explosive Acceleration to HSR (P90)', weight: 2 },
                    { id: 'sprintDistanceTIP)', label: 'Sprint Distance per 90min (TIP)', weight: 1 },
                    { id: 'sprintDistanceOTIP)', label: 'Sprint Distance per 90min (OTIP)', weight: 1 }
                ]
            },
            {
                name: 'Movement',
                weight: 4,
                metrics: [
                    { id: 'dangerousRuns', label: 'Dangerous Runs', weight: 2 },
                    { id: 'pullingHalfSpace', label: 'Pulling Half Space', weight: 1 },
                    { id: 'runsAhead', label: 'Runs Ahead', weight: 2 },
                    { id: 'runsAheadThreat', label: 'Runs Ahead Threat', weight: 1 },
                    { id: 'runsInBehind', label: 'Runs in Behind', weight: 2 },
                    { id: 'runsInBehindThreat', label: 'Runs in Behind Threat', weight: 1 },
                    { id: 'runsLeadingToShot', label: 'Runs Leading to Shot', weight: 2 },
                    { id: 'crossReceiverRuns', label: 'Cross Receiver Runs', weight: 2 },
                    { id: 'crossReceiverRunsThreat', label: 'Cross Receiver Runs Threat', weight: 1 }
                ]
            },
            {
                name: 'Passing Metrics',
                weight: 1,
                metrics: [
                    { id: 'passCompletionPullingWide', label: 'Pass Completion Pulling Wide', weight: 1 },
                    { id: 'passCompletionComingShort', label: 'Pass Completion Coming Short', weight: 1 },
                    { id: 'passCompletionRunsAhead', label: 'Pass Completion Runs Ahead', weight: 1 },
                    { id: 'passAttemptsToRuns', label: 'Pass Attempts to Player Making a Run', weight: 2 },
                    { id: 'passCompletionToRuns', label: 'Pass Completion to Player Making a Run', weight: 1 }
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

    'second_striker': {
        name: 'Second Striker',
        sections: [
            {
                name: 'Physical Metrics',
                weight: 2,
                metrics: [
                    { id: 'maxSpeed', label: 'Max Speed', weight: 1 },
                    { id: 'maxSpeedTop5', label: 'Max Speed Top 5', weight: 1 },
                    { id: 'explosiveAccelSprint', label: 'Explosive Acceleration to Sprint (P90)', weight: 1 },
                    { id: 'explosiveAccelHsr', label: 'Explosive Acceleration to HSR (P90)', weight: 1 },
                    { id: 'sprintCount', label: 'Sprint Count', weight: 1 }
                ]
            },
            {
                name: 'Movement',
                weight: 3,
                metrics: [
                    { id: 'comingShort', label: 'Coming Short', weight: 2 },
                    { id: 'pullingHalfSpace', label: 'Pulling Half Space', weight: 2 },
                    { id: 'pullingWideRuns', label: 'Pulling Wide Runs', weight: 2 },
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

    // ADD YOUR NEW PROFILES HERE:
    // Copy the structure above and modify for your needs
    // 
    // Example:
    // 'physical_cb': {
    //     name: 'Physical CB',
    //     emoji: '🛡️',
    //     sections: [
    //         {
    //             name: 'Aerial Ability',
    //             emoji: '🚁',
    //             metrics: [
    //                 { id: 'aerialDuelsWon', label: 'Aerial Duels Won' },
    //                 { id: 'headerAccuracy', label: 'Header Accuracy' }
    //             ]
    //         }
    //     ]
    // }
};