"use client";

import { useState, useRef } from "react";
import { importCSVFile } from "@/lib/csv-import";
import { Button } from "@/components/ui/button";

export default function ImportCSV() {
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Please select a CSV file' });
      return;
    }

    setIsImporting(true);
    setMessage(null);

    try {
      const result = await importCSVFile(file);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Refresh the page to show new leads
        window.location.reload();
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      console.error('Import error:', error);
      setMessage({ type: 'error', text: 'Failed to import CSV file' });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Import Leads</h3>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Upload your dealership contacts CSV file
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
              disabled={isImporting}
            />
            <label htmlFor="csv-upload">
              <Button 
                variant="outline" 
                className="cursor-pointer"
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : 'Choose CSV File'}
              </Button>
            </label>
          </div>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <div>Expected CSV format:</div>
          <div>• company, Industry, Title, First Name, Last Name</div>
          <div>• Emails, Address, City, State, Zip code</div>
          <div>• Web Address, phone, digital dealer</div>
        </div>
      </div>
    </div>
  );
}