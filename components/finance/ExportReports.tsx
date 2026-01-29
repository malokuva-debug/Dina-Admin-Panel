'use client';

import { Appointment, Expense } from '@/types';
import { storage, STORAGE_KEYS, storageMode } from '@/lib/storage';
import { supabase } from '@/lib/supabase';

export default function ExportReports() {
  const generateReport = async (months: number) => {
    let appointments: Appointment[] = [];
    let expenses: Expense[] = [];

    // Fetch data based on storage mode
    if (storageMode === 'supabase') {
      // Fetch only DONE appointments from Supabase
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('is_done', true);

      if (appointmentsError) {
        console.error('Appointments fetch error:', appointmentsError);
      } else {
        appointments = appointmentsData as Appointment[];
      }

      // Fetch all expenses from Supabase
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('*');

      if (expensesError) {
        console.error('Expenses fetch error:', expensesError);
      } else {
        expenses = expensesData as Expense[];
      }
    } else {
      // Use local storage
      appointments = storage.get(STORAGE_KEYS.APPOINTMENTS) || [];
      expenses = storage.get(STORAGE_KEYS.EXPENSES) || [];
      
      // Filter only done appointments
      appointments = appointments.filter(a => a.is_done);
    }

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - months + 1, 1);

    // Filter data by date range
    const relevantAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate >= startDate && aptDate <= today;
    });

    const relevantExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate >= startDate && expDate <= today;
    });

    // Calculate totals
const totalRevenue = relevantAppointments.reduce(
  (sum, apt) => sum + Number(apt.price || 0),
  0
);
const totalExpenses = relevantExpenses.reduce(
  (sum, exp) => sum + Math.abs(Number(exp.amount)) * exp.quantity,
  0
);
    const netProfit = totalRevenue - totalExpenses;

    // Revenue by worker
    const dinaRevenue = relevantAppointments
  .filter(apt => apt.worker?.toLowerCase() === 'dina')
  .reduce((sum, apt) => sum + Number(apt.price || 0), 0);

const kidaRevenue = relevantAppointments
  .filter(apt => apt.worker?.toLowerCase() === 'kida')
  .reduce((sum, apt) => sum + Number(apt.price || 0), 0);

    // Expenses by worker
    const dinaExpenses = relevantExpenses
  .filter(exp => exp.worker?.toLowerCase() === 'dina')
  .reduce((sum, exp) => sum + Math.abs(Number(exp.amount)) * exp.quantity, 0);

const kidaExpenses = relevantExpenses
  .filter(exp => exp.worker?.toLowerCase() === 'kida')
  .reduce((sum, exp) => sum + Math.abs(Number(exp.amount)) * exp.quantity, 0);

    return {
      period: months === 1 ? 'Current Month' : `Last ${months} Months`,
      totalRevenue,
      totalExpenses,
      netProfit,
      dinaRevenue,
      kidaRevenue,
      dinaExpenses,
      kidaExpenses,
      dinaNet: dinaRevenue - dinaExpenses,
      kidaNet: kidaRevenue - kidaExpenses,
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

      const report = await generateReport(months);

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

      const row = (label: string, value: string, valueColor?: [number, number, number]) => {
        doc.setTextColor(0, 0, 0);
        doc.text(label, 25, y);
        if (valueColor) {
          doc.setTextColor(...valueColor);
        }
        doc.text(value, pageWidth - 25, y, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        y += 8;
      };

      /* ===== Business Summary ===== */
      sectionTitle('Business Summary');
      row('Total Revenue', `$${report.totalRevenue.toFixed(2)}`, [0, 150, 0]);
      row('Total Expenses', `$${report.totalExpenses.toFixed(2)}`, [255, 0, 0]);
      row('Net Profit', `$${report.netProfit.toFixed(2)}`, report.netProfit >= 0 ? [0, 100, 0] : [255, 0, 0]);

      y += 6;

      /* ===== Revenue by Worker ===== */
      sectionTitle('Revenue by Worker');
      row('Dina Revenue', `$${report.dinaRevenue.toFixed(2)}`);
      row('Kida Revenue', `$${report.kidaRevenue.toFixed(2)}`);

      y += 6;

      /* ===== Expenses by Worker ===== */
      sectionTitle('Expenses by Worker');
      row('Dina Expenses', `$${report.dinaExpenses.toFixed(2)}`);
      row('Kida Expenses', `$${report.kidaExpenses.toFixed(2)}`);

      y += 6;

      /* ===== Net by Worker ===== */
      sectionTitle('Net Profit by Worker');
      row('Dina Net', `$${report.dinaNet.toFixed(2)}`, report.dinaNet >= 0 ? [0, 100, 0] : [255, 0, 0]);
      row('Kida Net', `$${report.kidaNet.toFixed(2)}`, report.kidaNet >= 0 ? [0, 100, 0] : [255, 0, 0]);

      y += 6;

      /* ===== Statistics ===== */
      sectionTitle('Statistics');
      row('Completed Appointments', report.appointmentCount.toString());
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
