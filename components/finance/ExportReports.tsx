'use client';

import { Appointment, Expense } from '@/types';
import { storage, STORAGE_KEYS } from '@/lib/storage';

export default function ExportReports() {
  const generateReport = (months: number) => {
    const appointments: Appointment[] = storage.get(STORAGE_KEYS.APPOINTMENTS) || [];
    const expenses: Expense[] = storage.get(STORAGE_KEYS.EXPENSES) || [];

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - months + 1, 1);

    // Filter data
    const relevantAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startDate && aptDate <= today;
    });

    const relevantExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= today;
    });

    // Calculate totals
    const totalRevenue = relevantAppointments.reduce((sum, apt) => sum + apt.price, 0);
    const totalExpenses = relevantExpenses.reduce((sum, exp) => sum + exp.amount * exp.quantity, 0);
    const netProfit = totalRevenue - totalExpenses;

    // Revenue by worker
    const dinaRevenue = relevantAppointments
      .filter(apt => apt.worker === 'dina')
      .reduce((sum, apt) => sum + apt.price, 0);
    const kidaRevenue = relevantAppointments
      .filter(apt => apt.worker === 'kida')
      .reduce((sum, apt) => sum + apt.price, 0);

    return {
      period: months === 1 ? 'Current Month' : `Last ${months} Months`,
      totalRevenue,
      totalExpenses,
      netProfit,
      dinaRevenue,
      kidaRevenue,
      appointmentCount: relevantAppointments.length,
      expenseCount: relevantExpenses.length,
      appointments: relevantAppointments,
      expenses: relevantExpenses,
    };
  };

  const exportPDF = async (type: 'month' | '6months' | '12months') => {
    const months = type === 'month' ? 1 : type === '6months' ? 6 : 12;
    
    try {
      // @ts-ignore - jsPDF is loaded via CDN
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      const report = generateReport(months);

      // Title
      doc.setFontSize(20);
      doc.text('Financial Report', 20, 20);

      // Period
      doc.setFontSize(12);
      doc.text(`Period: ${report.period}`, 20, 35);

      // Summary
      doc.setFontSize(14);
      doc.text('Summary', 20, 50);
      doc.setFontSize(11);
      doc.text(`Total Revenue: $${report.totalRevenue.toFixed(2)}`, 30, 60);
      doc.text(`Total Expenses: $${report.totalExpenses.toFixed(2)}`, 30, 68);
      doc.text(`Net Profit: $${report.netProfit.toFixed(2)}`, 30, 76);

      // Revenue by Worker
      doc.setFontSize(14);
      doc.text('Revenue by Worker', 20, 90);
      doc.setFontSize(11);
      doc.text(`Dina: $${report.dinaRevenue.toFixed(2)}`, 30, 100);
      doc.text(`Kida: $${report.kidaRevenue.toFixed(2)}`, 30, 108);

      // Stats
      doc.setFontSize(14);
      doc.text('Statistics', 20, 122);
      doc.setFontSize(11);
      doc.text(`Total Appointments: ${report.appointmentCount}`, 30, 132);
      doc.text(`Total Expenses: ${report.expenseCount}`, 30, 140);

      // Save
      const fileName = `financial-report-${type}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      alert('Report exported successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Please make sure jsPDF is loaded.');
    }
  };

  return (
    <div className="card">
      <h3>Export Reports</h3>
      <button 
        className="btn-primary" 
        onClick={() => exportPDF('month')}
        style={{ marginBottom: '10px' }}
      >
        Export Current Month
      </button>
      <button 
        className="btn-primary" 
        onClick={() => exportPDF('6months')}
        style={{ marginBottom: '10px' }}
      >
        Export Last 6 Months
      </button>
      <button 
        className="btn-primary" 
        onClick={() => exportPDF('12months')}
      >
        Export Last 12 Months
      </button>
    </div>
  );
}