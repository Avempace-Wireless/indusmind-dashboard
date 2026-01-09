# Energy History View - Quick Reference

## 🚀 Access the View
Navigate to: **http://localhost:5173/history** or click **"Historique"** in the sidebar

---

## 📋 Main Features at a Glance

### 1. **Metric Cards** (Top Section)
- Displays summary values for selected dates
- Shows difference and percentage change
- Color-coded by metric type
- Updates automatically when metrics/dates change

### 2. **Interactive Chart** (Center)
- Multi-line visualization with dual Y-axes
- Click legend items to show/hide datasets
- Zoom in/out buttons
- Toggle between line and bar chart
- Smooth animations and tooltips

### 3. **Data Table** (Bottom)
- Hourly breakdown for all selected metrics
- Supports primary and secondary date comparison
- Sticky header for easy scrolling
- Exportable to CSV

### 4. **Calendar Panel** (Right Sidebar)
- **Click** a date to select
- **Drag** across dates to select range (max 2 for comparison)
- **Navigate** months with arrow buttons
- **"Today"** button for quick access
- Visual indicators for selected dates and data availability

### 5. **Characteristics Filter** (Right Sidebar)
- Checkbox list of all available metrics:
  - ⚡ Énergie (kWh)
  - 🌱 CO₂ (kg)
  - 💰 Coût (EUR)
  - 📊 Consommation (kWh)
  - ☀️ Photovoltaïque (kWh)
  - 📈 Efficacité (%)
  - 🌡️ Température (°C)
  - And more...
- Toggle on/off to show/hide in chart and table

### 6. **Time Range Control** (Right Sidebar)
- **De** (From): Select starting hour (0-23)
- **À** (To): Select ending hour (0-23)
- Filters chart and table to selected hour range
- Displays total hours selected

### 7. **Options Panel** (Right Sidebar)
- **Un jour (One Day Mode)**: Toggle single vs comparison mode
- **Photovoltaïque**: Show/hide solar production data

### 8. **Export Buttons** (Top Right)
- **CSV**: Download current data as CSV file
- **PDF**: (Coming soon)
- **Reset**: Clear all selections and start fresh

---

## 🎯 Common Use Cases

### Use Case 1: View Today's Energy Consumption
1. Click "Today" button in calendar
2. Ensure "Énergie" is checked in Characteristics
3. View hourly breakdown in chart and table

### Use Case 2: Compare Two Days
1. Select first date in calendar
2. Select second date in calendar
3. Choose metrics to compare (e.g., Énergie, CO₂)
4. View side-by-side comparison in chart
5. Check metric cards for percentage change

### Use Case 3: Analyze Peak Hours
1. Select a date
2. Enable relevant metrics
3. Look for peaks in the chart
4. Adjust time range to focus on peak period (e.g., 14:00-18:00)
5. Export filtered data to CSV

### Use Case 4: Multi-Metric Correlation Analysis
1. Select a date
2. Enable multiple metrics (e.g., Énergie + Température + Efficacité)
3. Observe chart with dual Y-axes
4. Identify patterns and correlations
5. Export data for further analysis

### Use Case 5: Weekly Pattern Analysis
1. Select Monday from calendar
2. Navigate to next week
3. Select same weekday (Monday)
4. Compare weekly patterns
5. Check if behavior is consistent

---

## ⚙️ Settings & Controls

### Calendar Navigation
- **◀️ Prev**: Go to previous month
- **▶️ Next**: Go to next month
- **Aujourd'hui**: Jump to current month and select today

### Chart Controls
- **🔍 Zoom In**: Reduce time range for closer view
- **🔎 Zoom Out/Reset**: Reset to full 24-hour view
- **📊 Toggle Type**: Switch between line chart and bar chart
- **Legend Items**: Click to show/hide specific datasets

### Time Range
- Useful for filtering business hours (e.g., 8:00-18:00)
- Helps exclude overnight data
- Zoom feature also adjusts this range

### One Day Mode
- When enabled: Only one date can be selected
- When disabled: Can select up to 2 dates for comparison
- Automatically enforces single date selection

---

## 📊 Supported Metrics

### Energy Metrics
- ⚡ **Énergie** (kWh) - Total energy consumption
- 📊 **Consommation** (kWh) - Consumption rate
- ☀️ **Photovoltaïque** (kWh) - Solar production

### Environmental Metrics
- 🌱 **CO₂** (kg) - Carbon emissions

### Financial Metrics
- 💰 **Coût** (EUR) - Total cost
- 📈 **Coût Pic** (EUR) - Peak-hour costs
- 🧾 **Facture** (EUR) - Billing
- 💵 **Économies** (EUR) - Savings

### Operational Metrics
- 📊 **Efficacité** (%) - Efficiency rating
- 📈 **Utilisation** (%) - Capacity utilization
- ✅ **Disponibilité** (%) - System availability
- 🎯 **Rendement** (ratio) - Yield/return

### Infrastructure Metrics
- 🌡️ **Température** (°C) - Temperature
- 💨 **Pression** (bar) - Pressure
- 💧 **Débit** (m³/h) - Flow rate
- 💧 **Eau** (m³) - Water consumption
- 🔥 **Gaz** (m³) - Gas consumption

### Advanced Metrics
- ⚡ **PUE** (ratio) - Power Usage Effectiveness
- 👥 **Occupation** (persons) - Occupancy rate
- 🌡️ **Efficacité HVAC** (%) - HVAC efficiency

---

## 💡 Tips & Tricks

### 🎨 Visual Indicators
- **Blue highlight** = Selected date
- **Light blue** = Today's date
- **Green dot** = Data available for this date
- **Grey** = Other month's dates (not selectable in current view)

### 🖱️ Interactions
- **Single click** on calendar day = Select/deselect date
- **Click & drag** on calendar = Select date range
- **Hover** chart lines = See exact values in tooltip
- **Click** legend items = Toggle dataset visibility
- **Click** "X" on date chips = Remove individual date

### ⚡ Performance
- Chart updates automatically when selections change
- Data caches to avoid redundant fetches
- Table shows only selected hour range
- Export generates data on-demand

### 📱 Responsive Design
- **Desktop**: Side-by-side layout (chart left, controls right)
- **Tablet**: Stacked layout with optimized spacing
- **Mobile**: Single column, full-width components

### 🌙 Dark Mode
- Automatically adapts to system preference
- Toggle dark mode in browser/OS settings
- All colors optimized for dark backgrounds
- Chart tooltips remain readable

---

## 🔧 Troubleshooting

### No data showing in chart?
- ✅ Check that at least one metric is enabled in Characteristics
- ✅ Verify at least one date is selected in calendar
- ✅ Ensure time range is valid (From ≤ To)

### Chart not updating?
- ✅ Try clicking "Reset" button
- ✅ Check browser console for errors (F12)
- ✅ Refresh page (F5)

### Can't select more than one date?
- ✅ Check if "One Day Mode" is enabled
- ✅ Disable "Un jour" toggle in Options panel

### Export not working?
- ✅ Ensure popup blocker is not blocking downloads
- ✅ Check browser download settings
- ✅ Verify CSV opens in Excel/Sheets correctly

### Calendar navigation stuck?
- ✅ Click "Today" button to reset
- ✅ Use month arrows to navigate
- ✅ Check if dates are in valid range

---

## 🎓 Advanced Features

### Custom Time Ranges
Example: Analyze only business hours (8 AM - 6 PM)
1. Set **De** = 08:00
2. Set **À** = 18:00
3. Chart and table filter automatically
4. Export includes only selected hours

### Multi-Metric Comparison
Example: Energy vs Cost correlation
1. Enable **Énergie** and **Coût**
2. Select a date
3. Chart shows both metrics (dual Y-axes)
4. Look for cost spikes during high energy usage
5. Identify opportunities for load shifting

### Seasonal Comparison
Example: Summer vs Winter analysis
1. Navigate to June in calendar
2. Select a date (e.g., June 15)
3. Navigate to December
4. Select same day of month (December 15)
5. Compare consumption patterns
6. Identify seasonal variations

---

## 📖 Data Table Guide

### Table Structure
```
Time | Metric1 (Date1) | Metric2 (Date1) | Metric1 (Date2) | Metric2 (Date2)
-----|-----------------|-----------------|-----------------|----------------
00:00|      50.23      |      10.45      |      52.18      |      11.02
01:00|      45.67      |       9.82      |      48.91      |      10.35
...
```

### Reading the Table
- **Time Column**: Hour of day (00:00 - 23:00)
- **Metric Columns**: One column per metric per date
- **Values**: Formatted to metric's decimal places
- **Dash (-)**: No data available for that hour

### Exporting Table Data
1. Click "CSV" button in header
2. File downloads automatically
3. Open in Excel/Google Sheets
4. Data includes all visible columns
5. Headers show metric name, date, and unit

---

## 🔮 Coming Soon

### Planned Features
- 📄 PDF export with charts and tables
- 🔍 Advanced zoom (click and drag on chart)
- 📝 Chart annotations (add notes to specific points)
- 📊 Custom calculated metrics
- 🔔 Anomaly detection and alerts
- ⌨️ Keyboard shortcuts
- 🔗 Shareable view links
- 📈 Trend lines and forecasting
- 📉 Statistical analysis tools

---

## 📞 Need Help?

### Resources
- **Full Documentation**: See `ENERGY-HISTORY-IMPLEMENTATION-COMPLETE.md`
- **Code Reference**: Check `src/views/EnergyHistorical.vue`
- **Type Definitions**: See `src/types/metrics.ts`
- **Store Logic**: See `src/stores/useEnergyHistoryStore.ts`

### Common Questions
**Q: Can I compare more than 2 dates?**
A: Currently limited to 2 dates for clear visualization. Future versions may support more.

**Q: Can I add custom metrics?**
A: Yes! See developer documentation for adding new metric types.

**Q: How far back does historical data go?**
A: Depends on API integration. Mock data generates for any selected date.

**Q: Can I export charts as images?**
A: Not yet - PDF export will include chart images when implemented.

**Q: Does it work offline?**
A: Chart and UI work offline, but data fetching requires connection.

---

**Last Updated**: January 9, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
