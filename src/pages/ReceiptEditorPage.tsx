import { useEffect, useState } from "react";
import ReceiptEditor from "@/components/ReceiptEditor";
import { Navigate } from "react-router-dom";

const ReceiptEditorPage = () => {
  const [receiptData, setReceiptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get receipt data from localStorage
    const storedData = localStorage.getItem('editReceiptData');
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        setReceiptData(data);
      } catch (error) {
        console.error('Error parsing stored receipt data:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-gradient-bg flex items-center justify-center">
      <div className="text-center">Loading...</div>
    </div>;
  }

  if (!receiptData) {
    return <Navigate to="/custom-templates" replace />;
  }

  return (
    <ReceiptEditor 
      originalHTML={receiptData.html}
      onEditComplete={(newHTML) => {
        // Store updated HTML for potential email sending
        localStorage.setItem('receiptData', JSON.stringify({
          html: newHTML,
          subject: "Updated Receipt",
          fromName: "Store",
          fromEmail: "no-reply@store.com",
        }));
      }}
    />
  );
};

export default ReceiptEditorPage;