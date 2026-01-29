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
    // @ts-expect-error export library has invalid types
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const report = generateReport(months);

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    /* ===== Header ===== */
    doc.setFillColor(30, 41, 59); // dark slate
    doc.rect(0, 0, pageWidth, 35, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('Financial Report', 20, 22);

    doc.setFontSize(11);
    doc.text(report.period, 20, 30);

    doc.setTextColor(0, 0, 0);
    y = 50;

    /* ===== Section helper ===== */
    const sectionTitle = (title: string) => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 20, y);
      y += 4;
      doc.setDrawColor(200);
      doc.line(20, y, pageWidth - 20, y);
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
    };

    const row = (label: string, value: string) => {
      doc.text(label, 25, y);
      doc.text(value, pageWidth - 25, y, { align: 'right' });
      y += 8;
    };

    /* ===== Summary ===== */
    sectionTitle('Summary');
    row('Total Revenue', `$${report.totalRevenue.toFixed(2)}`);
    row('Total Expenses', `$${report.totalExpenses.toFixed(2)}`);
    row('Net Profit', `$${report.netProfit.toFixed(2)}`);

    y += 6;

    /* ===== Revenue by Worker ===== */
    sectionTitle('Revenue by Worker');
    row('Dina', `$${report.dinaRevenue.toFixed(2)}`);
    row('Kida', `$${report.kidaRevenue.toFixed(2)}`);

    y += 6;

    /* ===== Statistics ===== */
    sectionTitle('Statistics');
    row('Total Appointments', report.appointmentCount.toString());
    row('Total Expenses Recorded', report.expenseCount.toString());

    /* ===== Footer ===== */
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      footerY,
      { align: 'center' }
    );

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