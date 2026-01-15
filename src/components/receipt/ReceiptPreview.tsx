import { forwardRef } from 'react';
import { Credit } from '@/types';
import { format } from 'date-fns';
import headerLogos from '@/assets/header-logos.png';
import footerThankyou from '@/assets/footer-thankyou.png';

interface ReceiptPreviewProps {
  credit: Credit;
}

export const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(
  ({ credit }, ref) => {
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    };

    return (
      <div 
        ref={ref} 
        className="receipt-preview bg-white w-[360px] mx-auto rounded-lg overflow-hidden shadow-lg"
        style={{ aspectRatio: '3 / 4.5' }}
      >
        {/* Receipt Number & Date - Top Bar */}
        <div className="flex justify-between items-center px-6 py-3 bg-gray-50 border-b text-sm">
          <div>
            <span className="text-gray-500">Receipt No: </span>
            <span className="font-bold text-gray-800">{credit.serialNumber}</span>
          </div>
          <div>
            <span className="text-gray-500">Date: </span>
            <span className="font-bold text-gray-800">{format(new Date(credit.date), 'dd/MM/yyyy')}</span>
          </div>
        </div>

        {/* Header Logos - Full Width Image */}
        <div className="w-full">
          <img src={headerLogos} alt="SYS Puratheeel Logos" className="w-full h-auto block" />
        </div>

        {/* Content Section */}
        <div className="px-8 py-6 leading-relaxed text-gray-700">
          {/* Greeting */}
          <p className="text-lg font-bold mb-4">
            പ്രിയപ്പെട്ട <span className="text-[#1565c0]">{credit.donorName}</span>,
          </p>
          
          {/* Message Body */}
          <p className="text-base text-justify mb-4">
            SYS പുറത്തീൽ യൂണിറ്റ് സാന്ത്വനം ഫണ്ടിലേക്ക് സംഭാവന നൽകിയതിൽ ഹൃദയം നിറഞ്ഞ നന്ദി, 
            അല്ലാഹു നിങ്ങളുടെ എല്ലാ മേഖലകളിലും ബറകത്ത് നൽകട്ടെ. മഹാന്മാരോടൊപ്പം നമ്മെയും 
            നമ്മുടെ ബന്ധപ്പെടുന്നവരെയും സ്വർഗത്തിൽ ഒരുമിച്ച് കൂട്ടട്ടെ.
          </p>

          {/* Amount Section */}
          <div className="my-6 py-4 px-6 rounded-lg border-2 border-dashed border-[#4caf50] bg-[#e8f5e9] text-center">
            <p className="text-sm text-gray-600 mb-1">സംഭാവന തുക / Amount</p>
            <p className="text-3xl font-bold text-[#2e7d32]">{formatCurrency(credit.amount)}</p>
            {credit.purpose && (
              <p className="text-sm text-gray-500 mt-2">Purpose: {credit.purpose}</p>
            )}
          </div>
          
          {/* Prayer End */}
          <p className="text-lg font-bold text-[#2e7d32] mb-6">ആമീൻ.</p>
          
          {/* Signature */}
          <div className="text-right mt-6">
            <p className="font-bold text-base">പ്രസിഡന്റ്</p>
            <p className="text-sm text-gray-600">(SYS പുറത്തീൽ യൂണിറ്റ്)</p>
          </div>
        </div>

        {/* Footer with Thank You & Services - Full Width Image */}
        <div className="w-full">
          <img src={footerThankyou} alt="Thank You - Santhwanam Services" className="w-full h-auto block" />
        </div>
      </div>
    );
  }
);

ReceiptPreview.displayName = 'ReceiptPreview';
