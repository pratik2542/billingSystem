
import React, { useState, useEffect } from 'react';
import { type User, onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

import BillingForm from './components/BillingForm';
import Invoice from './components/Invoice';
import Auth from './components/Auth';
import BillHistory from './components/BillHistory';
import { LogoutIcon, NewBillIcon, HistoryIcon } from './components/Icons';

import { type BillItem, type InvoiceData } from './types';
import { PRODUCTS, GST_RATE } from './constants';

type View = 'form' | 'history';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('form');
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // Reset state on auth change
      setView('form');
      setCurrentInvoice(null);
    });
    return () => unsubscribe();
  }, []);

  // FIX: Separated invoice data for Firestore from local state to resolve Timestamp type mismatch.
  const handleGenerateBill = async (customerName: string, customerPhone: string, billItems: BillItem[]) => {
    if (!user) {
      alert("You must be logged in to generate a bill.");
      return;
    }
    const subtotal = billItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const gstAmount = subtotal * GST_RATE;
    const grandTotal = subtotal + gstAmount;

    const invoiceBaseData = {
      invoiceNumber: `GST-${Date.now()}`,
      date: new Date(),
      customerName,
      customerPhone,
      items: billItems,
      subtotal,
      gstAmount,
      grandTotal,
      userId: user.uid,
    };
    
    try {
      const docRef = await addDoc(collection(db, 'invoices'), {
        ...invoiceBaseData,
        createdAt: serverTimestamp(),
      });
      setCurrentInvoice({ ...invoiceBaseData, id: docRef.id });
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("Failed to save the invoice. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
      alert('Failed to log out.');
    }
  };

  const handleViewInvoice = (invoice: InvoiceData) => {
    setCurrentInvoice(invoice);
  };
  
  const handleBack = () => {
    setCurrentInvoice(null);
  };

  const switchView = (newView: View) => {
    setView(newView);
    setCurrentInvoice(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-amber-800 font-semibold">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-amber-50/50 font-sans text-gray-800 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl sm:text-5xl font-bold text-amber-900 tracking-tight">ગુજરાતી શુદ્ધ તેલ</h1>
              <p className="text-lg text-amber-700 mt-2">Groundnut Oil Billing System</p>
            </div>
            <nav className="flex items-center gap-2 sm:gap-4 no-print">
              <button onClick={() => switchView('form')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${view === 'form' && !currentInvoice ? 'bg-amber-600 text-white' : 'bg-white hover:bg-amber-100'}`}><NewBillIcon /> New Bill</button>
              <button onClick={() => switchView('history')} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${view === 'history' && !currentInvoice ? 'bg-amber-600 text-white' : 'bg-white hover:bg-amber-100'}`}><HistoryIcon /> History</button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-white hover:bg-red-100 text-red-600"><LogoutIcon /> Logout</button>
            </nav>
        </header>

        <main>
          {currentInvoice ? (
            <Invoice invoiceData={currentInvoice} onBack={handleBack} backButtonText={view === 'history' ? 'Back to History' : 'Create New Bill'} />
          ) : view === 'form' ? (
            <BillingForm products={PRODUCTS} onGenerateBill={handleGenerateBill} />
          ) : (
            <BillHistory user={user} onViewInvoice={handleViewInvoice} />
          )}
        </main>
        <footer className="text-center mt-12 text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} Gujarati Shuddh Tel. All Rights Reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;