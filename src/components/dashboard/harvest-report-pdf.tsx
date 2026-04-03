"use client";

import React, { forwardRef } from 'react';
import { Leaf, Calendar, Droplets, Sprout, TrendingUp, IndianRupee, ShieldCheck } from "lucide-react";

interface HarvestReportPDFProps {
  plotData: any;
  harvestStats: {
    totalWeight: string;
    profit: string;
    quality: string;
    date: string;
  };
  advisoryHistory: any[];
}

export const HarvestReportPDF = forwardRef<HTMLDivElement, HarvestReportPDFProps>(
  ({ plotData, harvestStats, advisoryHistory }, ref) => {
    
    // A4 aspect ratio container, standardized width for html2canvas consistency
    return (
      <div 
        ref={ref} 
        id="pdf-report-container"
        className="bg-white text-black p-10 mx-auto"
        style={{ 
          width: '794px', // A4 width in pixels at ~96dpi
          minHeight: '1123px', // A4 height
          boxSizing: 'border-box',
          position: 'absolute',
          top: '-9999px', // keep it hidden visually from DOM
          left: 0
        }}
      >
        {/* Header Ribbon */}
        <div className="border-b-4 border-green-600 pb-6 mb-8 flex justify-between items-end">
          <div className="flex items-center gap-3">
             <div className="h-14 w-14 bg-green-100 rounded-full flex items-center justify-center">
                <Leaf className="h-8 w-8 text-green-600" />
             </div>
             <div>
                <h1 className="text-4xl font-black text-gray-900 m-0">YieldIQ</h1>
                <p className="text-sm font-bold text-green-700 tracking-widest uppercase mt-1">Certified Harvest Report</p>
             </div>
          </div>
          <div className="text-right">
             <p className="text-gray-500 font-medium text-sm">Issued On</p>
             <p className="font-bold text-gray-900">{harvestStats.date}</p>
          </div>
        </div>

        {/* Plot Details & Final Yield Grid */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
             <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Plot Information</h2>
             <div className="space-y-3">
                <div className="flex justify-between">
                   <span className="text-gray-500 font-medium">Plot Alias</span>
                   <span className="font-bold">{plotData?.name || 'Main Field'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-gray-500 font-medium">Crop Cultivated</span>
                   <span className="font-bold">{plotData?.cropType || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-gray-500 font-medium">Soil Profile</span>
                   <span className="font-bold">{plotData?.soilType || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-gray-500 font-medium">Planting Date</span>
                   <span className="font-bold">{plotData?.plantingDate || 'N/A'}</span>
                </div>
             </div>
          </div>

          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
             <h2 className="text-lg font-bold text-green-900 border-b border-green-200 pb-2 mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" /> Season Outcomes
             </h2>
             <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 bg-green-200 rounded-lg flex items-center justify-center shrink-0">
                      <TrendingUp className="h-4 w-4 text-green-700" />
                   </div>
                   <div>
                     <p className="text-xs text-green-800 font-bold uppercase tracking-wider">Total Yield Weight</p>
                     <p className="text-xl font-black text-green-900">{harvestStats.totalWeight}</p>
                   </div>
                </div>
                
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 bg-green-200 rounded-lg flex items-center justify-center shrink-0">
                      <IndianRupee className="h-4 w-4 text-green-700" />
                   </div>
                   <div>
                     <p className="text-xs text-green-800 font-bold uppercase tracking-wider">Net Profit Generated</p>
                     <p className="text-xl font-black text-green-900">₹{harvestStats.profit}</p>
                   </div>
                </div>

                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 bg-green-200 rounded-lg flex items-center justify-center shrink-0">
                      <Sprout className="h-4 w-4 text-green-700" />
                   </div>
                   <div>
                     <p className="text-xs text-green-800 font-bold uppercase tracking-wider">Quality Grade</p>
                     <p className="text-xl font-black text-green-900">{harvestStats.quality}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Season AI History Summary */}
        <div>
           <h2 className="text-2xl font-black text-gray-900 mb-4 border-b-2 border-gray-100 pb-2">AI Agronomist Intervention Log</h2>
           <p className="text-gray-500 mb-6 font-medium text-sm">
             This crop was cultivated utilizing precision agriculture and AI-driven advisory from the YieldIQ platform.
           </p>

           <div className="space-y-4">
              {advisoryHistory && advisoryHistory.length > 0 ? (
                advisoryHistory.map((adv: any, index: number) => (
                  <div key={index} className="flex gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50/50">
                     <div className="w-24 shrink-0 border-r border-gray-200 pr-4">
                        <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                          {adv.date}
                        </span>
                     </div>
                     <div className="flex-1">
                        <h4 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                          {adv.type === 'SPRAY' && <Droplets className="h-4 w-4 text-orange-500"/>}
                          {adv.type === 'FERTILIZER' && <Sprout className="h-4 w-4 text-green-500"/>}
                          {adv.title}
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{adv.description}</p>
                        {adv.productName && (
                          <p className="text-xs font-bold text-green-700 mt-2 bg-green-100 inline-block px-2 py-0.5 rounded">
                            Applied: {adv.productName}
                          </p>
                        )}
                     </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                   <p className="text-gray-500 font-medium">No active intervention logs recorded for this plot.</p>
                </div>
              )}
           </div>
        </div>

        {/* Footer Signature */}
        <div className="absolute bottom-10 left-10 right-10 border-t border-gray-200 pt-6 flex justify-between items-center">
           <div>
             <p className="text-xs font-bold text-gray-400">Generated by</p>
             <div className="flex items-center gap-1.5 mt-1">
                <Leaf className="h-4 w-4 text-gray-400" />
                <span className="font-bold text-gray-500 text-sm tracking-tight text-opacity-80">YieldIQ Systems</span>
             </div>
           </div>
           
           <div className="text-right">
             <div className="text-xs bg-gray-100 text-gray-500 px-3 py-1.5 rounded-md font-mono border border-gray-200">
               VERIFIED RECORD: {plotData?.id || 'YIQ-' + Date.now()}
             </div>
           </div>
        </div>
      </div>
    );
  }
);
HarvestReportPDF.displayName = 'HarvestReportPDF';
