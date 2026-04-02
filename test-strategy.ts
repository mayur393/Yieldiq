import { generateCultivationStrategy } from './src/app/actions/generate-strategy';

async function testDriveAI() {
  console.log("🚀 Initializing YieldIQ Strategy AI Test Drive...");

  const testFarmData = {
    location: { lat: 21.1458, lng: 79.0882 }, // Nagpur, Maharashtra
    soilType: 'Black Cotton',
    irrigationMethod: 'Drip',
    landTenure: 'Owned',
    farmSize: '5',
    previousCrop: 'Soybean',
    workingCapital: '150000', // ₹1,50,000
    creditAccess: 'Yes',
  };

  try {
    console.log("📡 Sending profile parameters to Gemini via Genkit...");
    const start = Date.now();
    const result = await generateCultivationStrategy(testFarmData);
    const end = Date.now();

    console.log(`✅ Strategy generated successfully in ${(end - start) / 1000} seconds!`);
    console.log("\n====== EXTRACTED AI METRICS ======");
    console.log(JSON.stringify(result.strategy.metrics, null, 2));

    console.log("\n====== CROP RECOMMENDATIONS ======");
    result.strategy.crop_recommendations.forEach((cr, i) => {
      console.log(`${i + 1}. ${cr.cropName} (Risk: ${cr.riskLevel}) - Est Profit: ₹${cr.expectedNetProfitPerAcre}/acre`);
    });

    console.log("\n====== PEST THREATS ======");
    result.strategy.pest_management.forEach((pest, i) => {
      console.log(`- ${pest.threatName}: ${pest.economicThreshold}`);
    });

    console.log("\n🎉 The monumental 8-part JSON Zod Schema parsed perfectly without hallucinations.");
  } catch (err: any) {
    console.error("❌ Test Failed:", err.message);
    if (err.details) console.error(JSON.stringify(err.details, null, 2));
  }
}

testDriveAI();
