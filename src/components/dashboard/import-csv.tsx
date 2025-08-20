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
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import-csv', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage({ type: 'success', text: result.message });
        // Refresh the page to show new leads
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Import failed' });
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

  const handleImportDealerContacts = async () => {
    setIsImporting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/import-csv', {
        method: 'POST',
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setMessage({ 
          type: 'success', 
          text: `${result.message}. AI qualification is running in the background.` 
        });
        // Refresh the page to show new leads
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Import failed' });
      }
    } catch (error) {
      console.error('Import error:', error);
      setMessage({ type: 'error', text: 'Failed to import dealer contacts' });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-600 mb-4">Import Leads</h3>
      
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-center space-y-2">
            <div className="text-sm font-medium text-blue-900">
              Quick Start: Import Dealer Contacts
            </div>
            <div className="text-sm text-blue-700 mb-3">
              Import the automotive dealer contacts from your saved file
            </div>
            <Button 
              onClick={handleImportDealerContacts}
              disabled={isImporting}
              className="w-full text-gray-600"
            >
              {isImporting ? 'Importing & AI Qualifying...' : 'Import Dealer Contacts'}
            </Button>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm">or</div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Upload a different CSV file
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