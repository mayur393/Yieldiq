export const DEMO_DATA = {
  farm: {
    name: "Golden Wheat Estate",
    location: "Bathinda, Punjab",
    total_area_hectares: 25.5,
    number_of_plots: 3,
    plots: [
      {
        id: "plot-demo-1",
        name: "North Field",
        area: 10,
        soilType: "loamy",
        cropType: "Wheat",
        plantingDate: "2024-11-01",
        growthStage: "flowering",
        variety: "HD-2967",
        lastComputedInsights: true,
        latestAdvisory: {
          predictedYieldSummary: { display: "48 q/ac", subtitle: "Expected Harvest" },
          waterNeedsSummary: { level: "Medium", nextIrrigationText: "Irrigation due in 2 days" },
          soilHealthSummary: { score: 8.5, label: "Excellent" },
          riskSummary: { level: "Low", primaryRisk: "Minor Aphid pressure" },
          smartTasks: [
            { title: "Apply Top-dress Nitrogen", priority: "High", dueInDays: 1, rationale: "Critical for grain filling stage." },
            { title: "Monitor Soil Moisture", priority: "Medium", dueInDays: 2, rationale: "Prevent stress during flowering." }
          ]
        }
      },
      {
        id: "plot-demo-2",
        name: "East Sector",
        area: 8.5,
        soilType: "clay",
        cropType: "Mustard",
        plantingDate: "2024-10-15",
        growthStage: "ripening",
        variety: "Pusa-30",
        lastComputedInsights: true,
        latestAdvisory: {
          predictedYieldSummary: { display: "12 q/ac", subtitle: "Record Yield Expected" },
          waterNeedsSummary: { level: "Low", nextIrrigationText: "Soil moisture adequate" },
          soilHealthSummary: { score: 7.8, label: "Good" },
          riskSummary: { level: "Medium", primaryRisk: "Early Blight spotted" },
          smartTasks: [
             { title: "Harvest Prep", priority: "Medium", dueInDays: 5, rationale: "Crop reaching 90% maturity." }
          ]
        }
      },
      {
        id: "plot-demo-3",
        name: "Trial Block",
        area: 7,
        soilType: "silt",
        cropType: "Potato",
        plantingDate: "2024-12-05",
        growthStage: "vegetative",
        variety: "Kufri Jyoti",
        lastComputedInsights: false
      }
    ]
  },
  dashboard: {
    weather: "31°C • Sun-Drenched",
    yieldForecast: [
      { month: "Jan", yield: 120 },
      { month: "Feb", yield: 150 },
      { month: "Mar", yield: 210 },
      { month: "Apr", yield: 180 },
      { month: "May", yield: 240 },
    ],
    smartTasks: [
      { title: "Apply Fungicide - East Sector", priority: "High" },
      { title: "Irrigation Cycle - North Field", priority: "Medium" },
      { title: "Soil Testing - Trial Block", priority: "Low" }
    ]
  },
  historicalPlots: [
    {
      id: "hist-1",
      name: "North Field",
      cropType: "Wheat",
      soilType: "Loamy",
      plantingDate: "Nov 15, 2023",
      harvestDate: "April 10, 2024",
      yieldScore: "Grade A+",
      profit: "145,000",
      totalYield: "4.8 Tons",
      aiInterventions: 12
    },
    {
      id: "hist-2",
      name: "South Sector Test",
      cropType: "Cotton",
      soilType: "Black Soil",
      plantingDate: "May 20, 2023",
      harvestDate: "Oct 25, 2023",
      yieldScore: "Grade A",
      profit: "85,500",
      totalYield: "12 Quintals",
      aiInterventions: 8
    }
  ],
  mockAdvisoryHistory: [
    { date: "Oct 12, 2024", type: "FERTILIZER", title: "Vegetative Nutrient Boost", description: "Applied NPK 19:19:19 to support early leaf expansion." },
    { date: "Nov 05, 2024", type: "SPRAY", title: "Preventative Fungicide", description: "Recommended spray due to high humidity forecast." },
    { date: "Dec 10, 2024", type: "IRRIGATION", title: "Dry Spell Mitigation", description: "Triggered emergency drip irrigation overriding normal schedule." }
  ],
  advisory: {
    detailedReport: {
      waterQualityAnalysis: "pH: 7.2 | TDS: 450ppm. The water is suitable for irrigation, however, a slight alkaline trend suggests monitoring for micronutrient lockout.",
      irrigationRecommendations: "Maintain a 3-day split cycle. Flow rate should be kept at 0.5 GPM per nozzle.",
      fertilizerRecommendations: "Nitrogen top-dressing is critical this week. Use Urea at 45kg/acre.",
      soilManagementTips: "Evidence of compaction in North-East corner. Recommend localized tilling after harvest.",
      yieldOptimizationTips: [
        "Control Aphid population immediately to prevent viral transmission.",
        "Ensure uniform watering to avoid fruit cracking.",
        "Apply organic mulch to retain moisture."
      ],
      seasonalAlerts: "Heatwave predicted. Increase irrigation frequency by 20% over the next 48 hours."
    }
  },
  strategy: {
    recommendations: {
      metrics: {
        projectedYieldIncreasePercent: "+24%",
        estimatedProfitMargin: "32%",
        wasteReductionPercent: "15%"
      },
      agronomist_summary: "Based on your clay-loam soil profile and the upcoming El Niño weather trend, we recommend focusing on short-cycle, drought-resistant varieties. Your soil's potassium levels are excellent, supporting high starch development.",
      crop_recommendations: [
        {
          cropName: "Wheat (HD-2967)",
          whyThisCrop: "High resistance to local rust strains and excellent market MSP stability.",
          expectedYieldPerAcre: 52,
          expectedNetProfitPerAcre: 48500,
          marketPriceRange: "₹2,125 - ₹2,350 / q"
        },
        {
          cropName: "Mustard (Pusa-31)",
          whyThisCrop: "Lower water requirement makes it ideal for the predicted dry spell.",
          expectedYieldPerAcre: 14,
          expectedNetProfitPerAcre: 32000,
          marketPriceRange: "₹5,450 - ₹5,800 / q"
        },
        {
          cropName: "Chickpea",
          whyThisCrop: "Nitrogen-fixing properties will naturally improve your soil quality for next season.",
          expectedYieldPerAcre: 10,
          expectedNetProfitPerAcre: 28000,
          marketPriceRange: "₹4,875 - ₹5,100 / q"
        }
      ]
    },
    detailed: {
      input_plan: {
        irrigation: {
          method: "Drip Irrigation",
          frequency: "Every 4 days",
          duration: "45 mins",
          criticalStages: "Crown Root Initiation & Flowering"
        },
        fertilizerSchedule: [
          { stage: "Basal", fertilizer: "DAP", quantityPerAcre: "50 kg" },
          { stage: "Tillering", fertilizer: "Urea", quantityPerAcre: "45 kg" },
          { stage: "Jointing", fertilizer: "MOP", quantityPerAcre: "20 kg" }
        ]
      },
      economics: {
        itemizedCosts: [
          { item: "Seeds", costPerAcre: 2400 },
          { item: "Fertilizers", costPerAcre: 6800 },
          { item: "Labor", costPerAcre: 12000 }
        ],
        totalInputCost: 21200,
        expectedRevenue: 69700,
        netProfit: 48500,
        roi: "3.2x"
      },
      action_checklist: [
        { timing: "Week 1", action: "Soil sanitization and seed treatment." },
        { timing: "Week 4", action: "First irrigation and weed management." },
        { timing: "Week 12", action: "Pest monitoring for pod borers." }
      ],
      pest_management: [
        {
          threatName: "Termites",
          symptoms: "Yellowing of leaves, plant collapse.",
          chemicalControl: "Chlorpyrifos 20% EC",
          organicAlternative: "Neem Cake",
          bestSprayTiming: "Evening"
        }
      ],
      cultivation_calendar: [
        { stage: "Sowing", timing: "Day 0-7", actions: ["Land preparation", "Basal dose application"] },
        { stage: "Vegetative", timing: "Day 25-45", actions: ["First irrigation", "Urea top-dressing"] }
      ]
    }
  }
};
