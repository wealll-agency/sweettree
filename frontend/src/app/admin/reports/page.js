'use client';

import { useState } from 'react';
import { FileText, Table, Calendar, Download } from 'lucide-react';

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const handleExportPDF = () => {
    let url = 'http://localhost:7050/api/reports/export/pdf';
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    window.open(url, '_blank');
  };

  const handleExportExcel = () => {
    let url = 'http://localhost:7050/api/reports/export/excel';
    const params = [];
    if (startDate) params.push(`startDate=${startDate}`);
    if (endDate) params.push(`endDate=${endDate}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    window.open(url, '_blank');
  };

  return (
    <div className="container animate-fade-in" style={{ maxWidth: '780px' }}>
      <div className="mb-4">
        <h1 className="fw-bold m-0 display-font">Reports Center</h1>
        <p className="text-muted m-0">Generate, filter, and download spreadsheet logs or formal PDFs.</p>
      </div>

      <div className="card shadow-sm p-4 border-0 rounded-4 bg-white mb-4">
        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
          <Calendar size={20} color="var(--primary-color)" /> Filter Reporting Window
        </h5>
        
        <div className="row g-3">
          <div className="col-md-6">
            <label className="fw-medium mb-1 fs-7">Start Date</label>
            <input
              type="date"
              className="form-control"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          
          <div className="col-md-6">
            <label className="fw-medium mb-1 fs-7">End Date</label>
            <input
              type="date"
              className="form-control"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="row g-4">
        
        {/* PDF Card */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4 border-0 rounded-4 bg-white text-center h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 text-danger mb-3">
                <FileText size={32} />
              </div>
              <h5 className="fw-bold">PDF Executive Report</h5>
              <p className="text-muted fs-7 mb-4">
                A formal sales breakdown document featuring company metrics, gross sales summaries, and itemized customer transactions.
              </p>
            </div>
            
            <button 
              onClick={handleExportPDF}
              className="btn btn-danger py-2 w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <Download size={18} /> Export PDF Document
            </button>
          </div>
        </div>

        {/* Excel Card */}
        <div className="col-md-6">
          <div className="card shadow-sm p-4 border-0 rounded-4 bg-white text-center h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-inline-flex p-3 rounded-circle bg-success bg-opacity-10 text-success mb-3">
                <Table size={32} />
              </div>
              <h5 className="fw-bold">Excel Transaction Ledger</h5>
              <p className="text-muted fs-7 mb-4">
                A tabular spreadsheet compatible with Microsoft Excel, featuring granular data formulas, coupon deductions, taxes, and net profit margins.
              </p>
            </div>
            
            <button 
              onClick={handleExportExcel}
              className="btn btn-success py-2 w-100 d-flex align-items-center justify-content-center gap-2"
            >
              <Download size={18} /> Export Excel Ledger
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
