# KPI Cards: Detailed Explanation & Examples

## Overview

The **KPI Cards** in the ComparisonView display 5 key performance indicators that summarize the energy consumption across all selected meters for the selected time period. Each card includes hover tooltips for additional context.

---

## The 5 KPI Cards

### 1️⃣ **HIGHEST** 🟢 (Green)
**What it shows:** The meter that consumed the MOST energy during the selected period

**Formula:** 
```
Maximum total consumption among all selected meters
```

**Calculation Example:**
```
Selected meters for Last 7 Days:
  TGBT:         285.43 kWh  ← HIGHEST
  Clim:         195.22 kWh
  Compressors:  245.87 kWh
  Lighting:      45.23 kWh

Result: TGBT = 285.43 kWh (this meter consumed the most)
```

**Peak Information:**
- **Peak Date:** Date when this meter had its highest single-day consumption
- **Peak Value:** Consumption on that specific date (may be different from total)

**Example with Peak:**
```
Highest: 285.43 kWh
Meter: TGBT
Peak: 45.67 kWh on 2024-01-22  (highest single day)
```

**Use Case:** Identify which meter is the biggest energy consumer

---

### 2️⃣ **LOWEST** 🔴 (Gray)
**What it shows:** The meter that consumed the LEAST energy during the selected period

**Formula:**
```
Minimum total consumption among all selected meters
```

**Calculation Example:**
```
Selected meters for Last 7 Days:
  TGBT:         285.43 kWh
  Clim:         195.22 kWh
  Compressors:  245.87 kWh
  Lighting:      45.23 kWh  ← LOWEST

Result: Lighting = 45.23 kWh (this meter consumed the least)
```

**Min Information:**
- **Min Date:** Date when this meter had its lowest single-day consumption
- **Min Value:** Consumption on that specific date

**Example with Min:**
```
Lowest: 45.23 kWh
Meter: Lighting
Minimum: 5.34 kWh on 2024-01-19  (lowest single day)
```

**Use Case:** Identify meters with low consumption, baseline loads

---

### 3️⃣ **AVERAGE** 🔵 (Blue)
**What it shows:** Average consumption per meter (not average per day, but average across meters)

**Formula:**
```
AVERAGE = (Sum of all meter totals) ÷ (Number of meters)
          = TOTAL ÷ Number of meters
```

**Calculation Example:**
```
Selected 4 meters for Last 7 Days:
  TGBT:         285.43 kWh
  Clim:         195.22 kWh  
  Compressors:  245.87 kWh
  Lighting:      45.23 kWh
  ─────────────────────────
  TOTAL:        771.75 kWh

AVERAGE = 771.75 ÷ 4 = 192.94 kWh per meter
```

**Important Note:**
- This is **NOT** the average per day
- This is **NOT** the average consumption of all meters combined
- This is the **average consumption per individual meter**

**Use Case:** Baseline for variance calculation; understand typical meter consumption

---

### 4️⃣ **TOTAL** 🟣 (Purple)
**What it shows:** Sum of ALL energy consumed by ALL selected meters during the selected period

**Formula:**
```
TOTAL = Sum of all meter total consumptions
      = Σ (each meter's total consumption)
```

**Calculation Example:**
```
Selected 4 meters for Last 7 Days:
  TGBT:         285.43 kWh
  Clim:         195.22 kWh  
  Compressors:  245.87 kWh
  Lighting:      45.23 kWh
  ───────────────────────── 
  TOTAL:        771.75 kWh
```

**What's Included:**
- ✅ All selected meters' consumption
- ✅ Entire selected time period
- ❌ Not broken down by time or meter

**Use Case:** Overall energy budget, bill estimation, facility-wide consumption

---

### 5️⃣ **VARIANCE** 🟠 (Orange)
**What it shows:** How much consumption varies from highest to lowest, relative to the average

**Formula:**
```
VARIANCE = ((Highest - Lowest) ÷ Average) × 100
         = ((Max - Min) ÷ Average) × 100
```

**Interpretation:**
- **High variance (e.g., ±50%)** → Large difference between meters (unequal consumption)
- **Low variance (e.g., ±10%)** → Meters consume fairly equally
- **Zero variance** → All meters consume exactly the same

**Calculation Example:**
```
From previous data:
  Highest:  285.43 kWh (TGBT)
  Lowest:   45.23 kWh (Lighting)
  Average:  192.94 kWh

VARIANCE = ((285.43 - 45.23) ÷ 192.94) × 100
         = (240.20 ÷ 192.94) × 100
         = 1.245 × 100
         = 124.5% ← This means 124.5% spread from lowest to highest
```

**What This Means:**
```
Variance = ±124.5%

The spread between the highest (285.43) and lowest (45.23) is:
- 124.5% of the average (192.94)
- Visually: if average is 100%, the spread is 124.5% wide
- In other words: the highest meter uses 6.3× more than the lowest meter
```

**Variance Interpretation Guide:**
| Variance | Meaning | Example |
|----------|---------|---------|
| **0-20%** | Very uniform consumption | All meters ~similar usage |
| **20-50%** | Moderate variation | Some meters use more |
| **50-100%** | High variation | Big differences between meters |
| **>100%** | Very high variation | Highest meter >> Lowest meter |

**Use Case:**
- Monitor load balancing across systems
- Identify underutilized vs overutilized equipment
- Detect anomalies or imbalances

---

## Real-World Examples

### Example 1: Manufacturing Facility (Last 7 Days)

```
Meters:
  TGBT (main):      1,250 kWh
  Compressors:        890 kWh
  Chillers:           456 kWh
  Lighting:           234 kWh
  ─────────────────────────────
  TOTAL:           2,830 kWh

HIGHEST:   1,250 kWh (TGBT) ← 44% of total
           Peak: 210 kWh on Day 3

LOWEST:      234 kWh (Lighting) ← 8% of total
           Minimum: 28 kWh on Day 7 (Sunday)

AVERAGE:    (2,830 ÷ 4) = 707.5 kWh per meter

VARIANCE:   ((1,250 - 234) ÷ 707.5) × 100 = ±143.5%
           ↑ TGBT uses 5.3× more than Lighting
```

**Interpretation:**
- ✅ TGBT (main panel) dominates as expected (~44% of facility)
- ✅ Lighting is minor consumer (~8%)
- ⚠️ High variance (143.5%) indicates very unequal loads
- 💡 Could consider load balancing or sub-metering

---

### Example 2: Office Building (Last 4 Weeks - More Uniform)

```
Meters:
  Floor 1 (North):   1,890 kWh
  Floor 2 (South):   1,876 kWh
  Floor 3 (East):    1,845 kWh
  Common Areas:      1,862 kWh
  ────────────────────────────
  TOTAL:           7,473 kWh

HIGHEST:   1,890 kWh (Floor 1 North)
           Peak: 285 kWh on Monday

LOWEST:    1,845 kWh (Floor 3 East)
           Minimum: 178 kWh on Sunday

AVERAGE:   (7,473 ÷ 4) = 1,868.25 kWh per meter

VARIANCE:  ((1,890 - 1,845) ÷ 1,868.25) × 100 = ±2.4%
           ↑ Very balanced loads!
```

**Interpretation:**
- ✅ All floors use nearly identical amounts
- ✅ Low variance (2.4%) indicates good load distribution
- ✅ No major efficiency issues between floors
- 💡 Great balanced HVAC and lighting configuration

---

### Example 3: Mixed Equipment (Last 3 Months)

```
Meters:
  Production Line A:  12,450 kWh
  Production Line B:   4,230 kWh
  Backup System:         890 kWh
  Emergency Lights:      340 kWh
  ──────────────────────────────
  TOTAL:             17,910 kWh

HIGHEST:   12,450 kWh (Line A)
           Peak: 187 kWh/day (high production week)

LOWEST:      340 kWh (Emergency Lights)
           Minimum: 8 kWh/day (low usage)

AVERAGE:   (17,910 ÷ 4) = 4,477.5 kWh per meter

VARIANCE:  ((12,450 - 340) ÷ 4,477.5) × 100 = ±269.3%
           ↑ Extremely high variance (very unequal uses)
```

**Interpretation:**
- ✅ Line A dominates (69% of total) - this is expected for production
- ⚠️ Variance 269% is high, but normal for mixed production + safety loads
- 💡 Line A variations indicate production scheduling impacts
- 👀 Consider monitoring Line B for potential expansion

---

## Period Impact on KPIs

### Same 4 Meters, Different Periods:

#### Last 7 Days
```
HIGHEST:  285.43 | LOWEST: 45.23 | AVERAGE: 192.94 | TOTAL: 771.75 | VARIANCE: ±124.5%
```

#### Last 4 Weeks (28 days)
```
HIGHEST: 1,141.72 | LOWEST: 180.92 | AVERAGE: 771.75 | TOTAL: 3,087.00 | VARIANCE: ±124.5%
```
*(Note: Same variance ± because it's meter-to-meter relative, not time-dependent)*

#### Last 3 Months (90 days)
```
HIGHEST: 3,511.43 | LOWEST: 556.18 | AVERAGE: 2,376.08 | TOTAL: 9,504.32 | VARIANCE: ±124.5%
```

**Key Insight:** Variance stays the same because it compares meters to each other, not time periods!

---

## What NOT to Confuse KPIs With

### ❌ NOT: "Average Daily Consumption"
```
Wrong:     "Average = 192.94" means 192.94 kWh per day
Correct:   "Average = 192.94" means 192.94 kWh per meter (for the entire period)

Do NOT divide by number of days!
```

### ❌ NOT: "Peak Date of Any Meter"
```
Wrong:     The highest card shows the peak day of the facility
Correct:   The highest card shows which meter had MORE total consumption,
           with the peak date being that specific meter's highest single day
```

### ❌ NOT: "Percentage of Total"
```
Wrong:     HIGHEST = 285.43 kWh means it's 285.43% of something
Correct:   HIGHEST = 285.43 kWh is an absolute amount,
           The percentage (44.3%) comes from HIGHEST ÷ TOTAL × 100
```

### ❌ NOT: "Standard Deviation"
```
Wrong:     Variance is standard deviation
Correct:   Variance here = (Max - Min) / Average × 100
           This is a range-based metric, not statistical variance
```

---

## API Response Structure

The KPI data comes with detailed information from the backend:

```typescript
{
  highest: {
    meterId: "uuid-123",
    value: 285.43,           // Total consumption kWh
    peakDate: "2024-01-22",  // Date of peak for this meter
    peakValue: 45.67         // Peak consumption value
  },
  lowest: {
    meterId: "uuid-456",
    value: 45.23,
    minDate: "2024-01-19",
    minValue: 5.34
  },
  average: 192.94,            // (Sum of all meter totals) / number of meters
  total: 771.75,              // Sum of all meter totals
  variance: 124.5,            // ((max - min) / average) * 100
  meterTotals: [
    { meterId: "...", totalConsumption: 285.43, peakDate: "2024-01-22", peakValue: 45.67 },
    { meterId: "...", totalConsumption: 195.22, peakDate: "2024-01-21", peakValue: 38.91 },
    ...
  ]
}
```

---

## Interactive Features

### Hovering Over KPI Cards
When you hover over a KPI card, you see:
1. **Title Tooltip** - Full explanation of the metric
2. **Peak/Min Information** - Shows date and value
3. **Detail Row** - Extra context (meter count, spread, etc.)

**Example Hover for HIGHEST:**
```
Tooltip: "TGBT consumed the most: 285.43 kWh total (peak on 2024-01-22)"
Detail:  "Peak: 45.67 kWh on 2024-01-22"
```

### Calculating From Table Data
You can verify the KPIs by looking at the Comparison Table:
```
Table shows per-meter consumption:
  TGBT:    285.43 ✓ (matches HIGHEST)
  Lighting: 45.23 ✓ (matches LOWEST)
  All rows sum to 771.75 ✓ (matches TOTAL)
  Average of [285.43, 195.22, 245.87, 45.23] = 192.94 ✓ (matches AVERAGE)
```

---

## Decision Making with KPIs

### Use HIGHEST + LOWEST for:
- Identifying overused equipment (highest)
- Finding underutilized systems (lowest)
- Planning load balancing
- Capacity planning

### Use AVERAGE for:
- Baseline for comparison
- Typical meter consumption
- Budgeting per meter
- Variance calculation

### Use TOTAL for:
- Facility-wide energy bill
- Sustainability goals
- Monthly/annual trending
- Cost analysis

### Use VARIANCE for:
- Load distribution quality
- Power factor analysis
- Identifying imbalances
- Efficiency optimization

---

## Troubleshooting

### KPI Cards Show "0"
**Cause:** No data returned from API for selected meters/period
**Fix:** Check date range, verify meters have data

### Highest and Lowest are Same
**Cause:** Only 1 meter selected
**Fix:** Select multiple meters to compare

### Variance Seems Low (e.g., ±5%)
**Cause:** Your meters consume similar amounts (good!)
**Fix:** This is normal for balanced systems

### Variance is Very High (>200%)
**Cause:** Huge difference between highest and lowest meter
**Fix:** Normal for mixed equipment (HVAC, production, lighting, etc.)

---

## Summary Table

| Card | Shows | Formula | Used For |
|------|-------|---------|----------|
| **HIGHEST** | Meter with max consumption | MAX(meter_totals) | Identify top consumer |
| **LOWEST** | Meter with min consumption | MIN(meter_totals) | Identify minimal loads |
| **AVERAGE** | Mean per meter | TOTAL ÷ # meters | Baseline, variance ref |
| **TOTAL** | Sum of all meters | Σ meter_totals | Facility consumption |
| **VARIANCE** | Consumption spread (%) | ((MAX-MIN) ÷ AVG) × 100 | Load distribution quality |

---

**Updated:** February 12, 2026  
**Version:** 2.0 - Enhanced with peak dates and detailed explanations
