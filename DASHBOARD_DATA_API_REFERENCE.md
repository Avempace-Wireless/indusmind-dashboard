# Dashboard & Puissance View - Data API Reference

Complete documentation of all cards and charts in Dashboard View and Puissance View, including the API endpoints and parameters used to fetch their data.

---

## Dashboard View (`src/features/dashboard/views/DashboardView.vue`)

### Overview
The Dashboard View displays a summary of all selected meters with their current instantaneous power, today's energy consumption, and mini-charts for trend visualization.

---

### 1. **Meters Table - Instantaneous Power Column**

**Component Location:** `DashboardView.vue` - Table Row

**Purpose:** Display the current instantaneous power draw for each meter in kilowatts (kW)

**API Endpoint:**
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:**
```
keys=ActivePowerTotal
startTs={now - 24 hours}
endTs={now}
limit=1
agg=NONE
orderBy=DESC
```

**Example Request:**
```
http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=ActivePowerTotal&startTs=1705689600000&endTs=1705776000000&limit=1&agg=NONE&orderBy=DESC
```

**Data Used:** 
- `currentPower` - Latest ActivePowerTotal value (in Watts, displayed as kW)

**Unit:** kW (kilowatts)

**Update Frequency:** On page load and when meter selection changes

---

### 2. **Meters Table - Today's Energy Column**

**Component Location:** `DashboardView.vue` - Table Row

**Purpose:** Display total energy consumed today in kilowatt-hours (kWh)

**API Endpoint:**
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:**
```
keys=deltaDayEnergyConsumtion
startTs={today at 00:00:00}
endTs={now}
limit=1
agg=NONE
orderBy=DESC
```

**Example Request:**
```
http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=deltaDayEnergyConsumtion&startTs=1705708800000&endTs=1705795200000&limit=1&agg=NONE&orderBy=DESC
```

**Data Used:**
- `todayEnergy` - Latest deltaDayEnergyConsumtion value (energy consumed since midnight)

**Unit:** kWh (kilowatt-hours)

**Update Frequency:** On page load and when meter selection changes

---

### 3. **Mini-Chart - Instantaneous Readings (1 hour, 5-min intervals)**

**Component Location:** `DashboardView.vue` - Right column

**Purpose:** Display a trend chart of power consumption over the last hour at 5-minute intervals

**API Endpoint:**
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:**
```
keys=ActivePowerTotal
startTs={now - 1 hour}
endTs={now}
interval=300000 (5 minutes in milliseconds)
agg=AVG
limit=12
orderBy=ASC
```

**Example Request:**
```
http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=ActivePowerTotal&startTs=1705760400000&endTs=1705764000000&interval=300000&agg=AVG&limit=12&orderBy=ASC
```

**Data Used:**
- `instantReadings` - Array of ActivePowerTotal values aggregated every 5 minutes

**Unit:** kW (kilowatts)

**Update Frequency:** On page load and when meter selection changes

**Chart Type:** Line chart showing power trend

---

### 4. **Mini-Chart - Today's Energy Readings (Daily aggregation)**

**Component Location:** `DashboardView.vue` - Right column

**Purpose:** Display today's energy consumption profile throughout the day

**API Endpoint:**
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:**
```
keys=deltaDayEnergyConsumtion
startTs={today at 00:00:00}
endTs={now}
interval=3600000 (1 hour in milliseconds)
agg=SUM
orderBy=ASC
```

**Example Request:**
```
http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=deltaDayEnergyConsumtion&startTs=1705708800000&endTs=1705795200000&interval=3600000&agg=SUM&orderBy=ASC
```

**Data Used:**
- `todayReadings` - Array of deltaDayEnergyConsumtion values at hourly intervals

**Unit:** kWh (kilowatt-hours)

**Update Frequency:** On page load and when meter selection changes

**Chart Type:** Bar chart showing hourly energy consumption

---

## Puissance View (`src/features/puissance/views/PuissanceView.vue`)

### Overview
The Puissance (Power) View provides a detailed analysis of a single selected meter with 7 KPI cards and multiple charts showing power consumption patterns over different time periods.

---

### KPI Cards Section

#### **Card 1: Instantaneous Consumption**

**Component:** `KPICard.vue`

**Purpose:** Display the current instantaneous power draw in kilowatts (kW)

**API Endpoint:**
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:**
```
keys=ActivePowerTotal
startTs={now - 24 hours}
endTs={now}
limit=1
agg=NONE
orderBy=DESC
```

**Example Request:**
```
http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=ActivePowerTotal&startTs=1705689600000&endTs=1705776000000&limit=1&agg=NONE&orderBy=DESC
```

**Data Used:**
- `instantaneousConsumption` - Latest ActivePowerTotal value

**Unit:** kW (kilowatts)

**Calculation:** Direct value from latest API response

---

#### **Card 2: Consumed This Hour**

**Component:** `KPICard.vue`

**Purpose:** Display total energy consumed in the current hour in kilowatt-hours (kWh)

**API Endpoint:**
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:**
```
keys=deltaHourEnergyConsumtion
startTs={now - 24 hours}
endTs={now}
limit=1
agg=NONE
orderBy=DESC
```

**Example Request:**
```
http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=deltaHourEnergyConsumtion&startTs=1705689600000&endTs=1705776000000&limit=1&agg=NONE&orderBy=DESC
```

**Data Used:**
- `consumedThisHour` - Latest deltaHourEnergyConsumtion value

**Unit:** kWh (kilowatt-hours)

**Calculation:** Direct value from latest API response

---

#### **Card 3: Consumed Today**

**Component:** `KPICard.vue`

**Purpose:** Display total energy consumed since midnight today

**API Endpoint:**
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:**
```
keys=ActivePowerTotal,AccumulatedActiveEnergyDelivered
startTs={1st day of current month at 00:00:00}
endTs={now}
agg=NONE
limit=10000
orderBy=ASC
```

**Example Request:**
```
http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=ActivePowerTotal,AccumulatedActiveEnergyDelivered&startTs=1705708800000&endTs=1705795200000&agg=NONE&limit=10000&orderBy=ASC
```

**Data Used:**
- Raw ActivePowerTotal values from today
- Time range: `today_start (00:00:00)` to `now`

**Unit:** kWh (kilowatt-hours)

**Calculation:** 
```
Average Power (kW) × Hours Elapsed = Energy Consumed (kWh)
```

---

#### **Card 4: Consumed Yesterday**

**Component:** `KPICard.vue`

**Purpose:** Display total energy consumed yesterday

**API Endpoint:**
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:**
```
keys=AccumulatedActiveEnergyDelivered
startTs={1st day of current month at 00:00:00}
endTs={now}
agg=NONE
limit=10000
orderBy=ASC
```

**Example Request:**
```
http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=AccumulatedActiveEnergyDelivered&startTs=1705708800000&endTs=1705795200000&agg=NONE&limit=10000&orderBy=ASC
```

**Data Used:**
- AccumulatedActiveEnergyDelivered values
- Time range: `yesterday_start` to `yesterday_end`

**Unit:** kWh (kilowatt-hours)

**Calculation:**
```
Energy[yesterday_end] - Energy[yesterday_start] = Energy Consumed Yesterday
```

---

#### **Card 5: Consumed Day Before Yesterday**

**Component:** `KPICard.vue`

**Purpose:** Display total energy consumed 2 days ago

**API Endpoint:** (Same as Card 4)
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:** (Same as Card 4)
```
keys=AccumulatedActiveEnergyDelivered
startTs={1st day of current month at 00:00:00}
endTs={now}
agg=NONE
limit=10000
orderBy=ASC
```

**Data Used:**
- AccumulatedActiveEnergyDelivered values
- Time range: `dayBefore_start` to `dayBefore_end`

**Unit:** kWh (kilowatt-hours)

**Calculation:**
```
Energy[dayBefore_end] - Energy[dayBefore_start] = Energy Consumed Day Before Yesterday
```

---

#### **Card 6: Consumed This Month**

**Component:** `KPICard.vue`

**Purpose:** Display total energy consumed since the first day of the current month

**API Endpoint:** (Same as Card 4)
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:** (Same as Card 4)
```
keys=AccumulatedActiveEnergyDelivered
startTs={1st day of current month at 00:00:00}
endTs={now}
agg=NONE
limit=10000
orderBy=ASC
```

**Data Used:**
- AccumulatedActiveEnergyDelivered values
- Time range: `month_start` to `now`

**Unit:** kWh (kilowatt-hours)

**Calculation:**
```
Energy[latest] - Energy[month_start] = Energy Consumed This Month
```

---

#### **Card 7: Consumed Last Month**

**Component:** `KPICard.vue`

**Purpose:** Display total energy consumed in the previous calendar month

**API Endpoint:** (Same as Card 4)
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:** (Same as Card 4)
```
keys=AccumulatedActiveEnergyDelivered
startTs={1st day of current month at 00:00:00}
endTs={now}
agg=NONE
limit=10000
orderBy=ASC
```

**Data Used:**
- AccumulatedActiveEnergyDelivered values
- Time range: `lastMonth_start` to `lastMonth_end`

**Unit:** kWh (kilowatt-hours)

**Calculation:**
```
Energy[lastMonth_end] - Energy[lastMonth_start] = Energy Consumed Last Month
```

---

### Charts Section

#### **Chart 1: Hourly Power Chart (Last 24 Hours)**

**Component:** `BarChart.vue`

**Purpose:** Display average power consumption for each hour of the day

**API Endpoint:**
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:**
```
keys=ActivePowerTotal
startTs={now - 24 hours}
endTs={now}
interval=3600000 (1 hour in milliseconds)
agg=AVG
limit=24
orderBy=ASC
```

**Example Request:**
```
http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=ActivePowerTotal&startTs=1705689600000&endTs=1705776000000&interval=3600000&agg=AVG&limit=24&orderBy=ASC
```

**Data Used:**
- `hourlyData` - ActivePowerTotal averaged per hour

**Unit:** kW (kilowatts)

**Chart Type:** Bar chart

**X-Axis:** Hour of day

**Y-Axis:** Average power (kW)

---

#### **Chart 2: Daily Power Chart (Last 30 Days)**

**Component:** `BarChart.vue`

**Purpose:** Display average daily power consumption over the last month

**API Endpoint:**
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:**
```
keys=ActivePowerTotal
startTs={now - 30 days}
endTs={now}
interval=86400000 (1 day in milliseconds)
agg=AVG
limit=30
orderBy=ASC
```

**Example Request:**
```
http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=ActivePowerTotal&startTs=1703183040000&endTs=1705861440000&interval=86400000&agg=AVG&limit=30&orderBy=ASC
```

**Data Used:**
- `dailyData` - ActivePowerTotal averaged per day

**Unit:** kW (kilowatts)

**Chart Type:** Bar chart

**X-Axis:** Day of month

**Y-Axis:** Average daily power (kW)

---

#### **Chart 3: Monthly Power Chart (Last 12 Months)**

**Component:** `BarChart.vue`

**Purpose:** Display average monthly power consumption over the last year

**API Endpoint:**
```
GET /telemetry/{deviceUUID}/timeseries
```

**Query Parameters:**
```
keys=ActivePowerTotal
startTs={now - 365 days}
endTs={now}
interval=2592000000 (30 days in milliseconds)
agg=AVG
limit=12
orderBy=ASC
```

**Example Request:**
```
http://localhost:4000/telemetry/545ffcb0-ab9c-11f0-a05e-97f672464deb/timeseries?keys=ActivePowerTotal&startTs=1674225600000&endTs=1705776000000&interval=2592000000&agg=AVG&limit=12&orderBy=ASC
```

**Data Used:**
- `monthlyData` - ActivePowerTotal averaged per 30-day period

**Unit:** kW (kilowatts)

**Chart Type:** Bar chart

**X-Axis:** Month/30-day period

**Y-Axis:** Average monthly power (kW)

---

## Data Flow Summary

### Dashboard View Data Flow
```
1. User selects meters
   ↓
2. For each selected meter:
   a) Fetch latest ActivePowerTotal → Display in Instantaneous column
   b) Fetch latest deltaDayEnergyConsumtion → Display in Today's Energy column
   c) Fetch last 1 hour of ActivePowerTotal (5-min intervals, AVG) → Instantaneous chart
   d) Fetch today's deltaDayEnergyConsumtion (hourly, SUM) → Today's Energy chart
   ↓
3. Display all data in table and charts
```

### Puissance View Data Flow
```
1. User selects a single meter
   ↓
2. Fetch batch of telemetry data:
   a) Latest ActivePowerTotal (DESC, limit 1) → Instantaneous Consumption KPI
   b) Latest deltaHourEnergyConsumtion (DESC, limit 1) → Consumed This Hour KPI
   c) Month-long AccumulatedActiveEnergyDelivered + ActivePowerTotal → Calculate other KPIs
   d) Last 24 hours ActivePowerTotal (hourly AVG) → Hourly chart
   e) Last 30 days ActivePowerTotal (daily AVG) → Daily chart
   f) Last 365 days ActivePowerTotal (30-day AVG) → Monthly chart
   ↓
3. Calculate derived metrics (Today, Yesterday, This Month, Last Month)
   ↓
4. Display 7 KPI cards and 3 charts
```

---

## API Parameters Reference

| Parameter | Type | Example | Description |
|-----------|------|---------|-------------|
| `keys` | string | `ActivePowerTotal` | Comma-separated telemetry keys to fetch |
| `startTs` | number | `1705689600000` | Start timestamp in milliseconds (UTC) |
| `endTs` | number | `1705776000000` | End timestamp in milliseconds (UTC) |
| `interval` | number | `300000` | Aggregation interval in milliseconds |
| `agg` | string | `AVG`, `SUM`, `NONE` | Aggregation function |
| `limit` | number | `100` | Maximum number of data points to return |
| `orderBy` | string | `ASC`, `DESC` | Sort order (ASC = oldest first, DESC = newest first) |

---

## Telemetry Keys Reference

| Key | Label | Unit | Description | Source |
|-----|-------|------|-------------|--------|
| `ActivePowerTotal` | Active Power | kW | Instantaneous power draw | ThingsBoard PM2200 meter |
| `AccumulatedActiveEnergyDelivered` | Cumulative Energy | kWh | Total energy delivered (cumulative counter) | ThingsBoard PM2200 meter |
| `deltaHourEnergyConsumtion` | Hourly Consumption | kWh | Energy consumed in the current hour | ThingsBoard PM2200 meter |
| `deltaDayEnergyConsumtion` | Daily Consumption | kWh | Energy consumed since midnight | ThingsBoard PM2200 meter |

---

## Performance Notes

- **Batch Fetching:** Puissance View uses batch API calls to fetch multiple data series in parallel, reducing total request time
- **Caching:** Telemetry composable implements 5-minute TTL caching to avoid redundant API calls
- **Data Point Limits:** 
  - Latest values: `limit=1` for instant readings
  - Month-long raw data: `limit=10000` to ensure no data loss
  - Charts: `limit=24/30/12` for aggregated data
- **Aggregation:** Server-side aggregation (AVG, SUM) reduces data transfer and calculation overhead

---

## Last Updated
January 23, 2026
