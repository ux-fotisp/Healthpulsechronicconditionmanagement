/**
 * HealthPulse · Sprint 2 — S2-1 Biometric Reading Contextualization
 * Returns plain-language interpretation for any observation type.
 * Grade 6-8 reading level target per Kutner et al. (2006).
 */

export interface ReadingInterpretation {
  headline: string;
  detail: string;
  action?: string;
  sentiment: "positive" | "neutral" | "caution" | "alert";
}

/**
 * Parse the numeric systolic value from a BP string like "132/84"
 */
function parseSystolic(value: string): number {
  return parseInt(value.split("/")[0], 10) || 0;
}

function parseSingle(value: string): number {
  return parseFloat(value) || 0;
}

export function getReadingContext(
  type: string,
  value: string,
  status: "normal" | "warning" | "critical"
): ReadingInterpretation {
  switch (type) {
    case "Blood Pressure": {
      const sys = parseSystolic(value);
      if (sys < 120)
        return {
          headline: "Your blood pressure looks great!",
          detail: `${value} mmHg is in the healthy range. Keep up what you're doing — it's working.`,
          sentiment: "positive",
        };
      if (sys < 130)
        return {
          headline: "Slightly elevated — worth watching",
          detail: `${value} mmHg is a little above the ideal target of 120/80. It's not a cause for alarm, but monitoring it closely is a good idea.`,
          action: "Try to reduce salt in your diet and check again tomorrow.",
          sentiment: "neutral",
        };
      if (sys < 140)
        return {
          headline: "A bit higher than your goal",
          detail: `${value} mmHg is in the Stage 1 range. For most people with hypertension, the goal is to stay under 130/80.`,
          action: "Bring this up at your next visit with your doctor.",
          sentiment: "caution",
        };
      return {
        headline: "Higher than the safe range",
        detail: `${value} mmHg is above 140 — the Stage 2 range. If you feel fine and this happens once, don't panic. But if it stays this high, contact your care team.`,
        action: "Contact Dr. Chen if readings stay above 140 for two days in a row.",
        sentiment: "alert",
      };
    }

    case "Blood Glucose": {
      const val = parseSingle(value);
      if (val < 70)
        return {
          headline: "Blood sugar is too low",
          detail: `${value} mg/dL is below the safe range (70–99). Low blood sugar can make you feel shaky, dizzy, or confused.`,
          action: "Eat or drink something with sugar now — like juice or glucose tablets. If you feel unwell, call your doctor.",
          sentiment: "alert",
        };
      if (val <= 99)
        return {
          headline: "Blood sugar is in the healthy range!",
          detail: `${value} mg/dL is right where it should be. The target fasting range is 70–99 mg/dL. Great job managing your levels.`,
          sentiment: "positive",
        };
      if (val <= 125)
        return {
          headline: "A little above the normal range",
          detail: `${value} mg/dL is slightly above normal (70–99 mg/dL). Values between 100–125 are called prediabetes range. This is manageable with diet and medication.`,
          action: "Try to reduce sugary foods and carbs today. Log your next meal.",
          sentiment: "caution",
        };
      return {
        headline: "Blood sugar is above the diabetes range",
        detail: `${value} mg/dL is above 126 — above the threshold used to diagnose diabetes. This could mean your medication needs a review.`,
        action: "Contact your care team. Do not skip your next Metformin dose.",
        sentiment: "alert",
      };
    }

    case "Heart Rate": {
      const val = parseSingle(value);
      if (val < 50)
        return {
          headline: "Heart rate is quite low",
          detail: `${value} bpm is below 50. This can be normal for people who exercise a lot, but it can also signal a problem.`,
          action: "Let your doctor know about this reading at your next visit.",
          sentiment: "caution",
        };
      if (val <= 100)
        return {
          headline: "Heart rate is healthy!",
          detail: `${value} bpm is right in the normal range of 60–100 beats per minute. Your heart rhythm looks steady.`,
          sentiment: "positive",
        };
      return {
        headline: "Heart rate is a bit fast",
        detail: `${value} bpm is above 100. This can happen after exercise, stress, or caffeine. If it stays high at rest, it's worth mentioning.`,
        action: "Rest, drink water, and log your heart rate again in 30 minutes.",
        sentiment: "caution",
      };
    }

    case "SpO₂": {
      const val = parseSingle(value);
      if (val >= 96)
        return {
          headline: "Oxygen levels are normal!",
          detail: `${value}% is a healthy reading. Normal oxygen levels are 95% and above. Your lungs are doing their job well.`,
          sentiment: "positive",
        };
      if (val >= 94)
        return {
          headline: "Oxygen is a little low",
          detail: `${value}% is just below the ideal range of 95–100%. This can happen if you were moving around during the reading.`,
          action: "Try measuring again while sitting quietly. If it stays below 94%, call your doctor.",
          sentiment: "caution",
        };
      return {
        headline: "Oxygen is below the safe level",
        detail: `${value}% is below 94%, which is lower than it should be. This needs attention.`,
        action: "Seek medical attention. Call your doctor or go to an urgent care clinic.",
        sentiment: "alert",
      };
    }

    case "Weight": {
      if (status === "normal")
        return {
          headline: "Weight is on track",
          detail: `${value} kg is within your tracked range. Stable weight is a good sign when managing blood pressure and blood sugar.`,
          sentiment: "positive",
        };
      return {
        headline: "Weight change noted",
        detail: `Your weight of ${value} kg is a little outside your usual range. A small change day to day is normal, but a bigger trend over time is worth watching.`,
        action: "Discuss any unintentional weight changes with your doctor.",
        sentiment: "caution",
      };
    }

    default:
      if (status === "normal")
        return {
          headline: "Reading looks normal",
          detail: `Your ${type.toLowerCase()} of ${value} is within the expected range.`,
          sentiment: "positive",
        };
      return {
        headline: "Reading is outside the normal range",
        detail: `Your ${type.toLowerCase()} of ${value} is outside the expected range. Keep track of this and share it with your doctor.`,
        sentiment: "caution",
      };
  }
}
