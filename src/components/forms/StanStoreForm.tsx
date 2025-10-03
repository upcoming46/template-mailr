import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateReceiptHTML, getTemplateHTML } from "@/lib/templateUtils";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { format } from "date-fns";

const StanStoreForm = () => {
  const [formData, setFormData] = useState({
    RECEIPT_ID: "",
    AMOUNT_PAID: "",
    DATE_PAID: format(new Date(), "MMM dd, yyyy, h:mm:ss a"),
    PAYMENT_METHOD: "MasterCard",
    CARD_LAST4: "",
    PRODUCT_NAME: "",
    BUYER_NAME: "",
    PRODUCT_PRICE: "",
    TOTAL_AMOUNT: "",
    SELLER_EMAIL: ""
  });
  const [generatedHTML, setGeneratedHTML] = useState("");
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateReceipt = () => {
    const template = getTemplateHTML("stanstore");
    const html = generateReceiptHTML(template, formData);
    setGeneratedHTML(html);
    toast({
      title: "Receipt generated",
      description: "Your Stan Store receipt is ready!"
    });
  };

  const sendToEmailPage = () => {
    localStorage.setItem('receiptData', JSON.stringify({
      html: generatedHTML,
      platform: 'stanstore',
      subject: `Receipt for ${formData.PRODUCT_NAME || 'Your Purchase'}`,
      fromName: 'Stan',
      fromEmail: 'no-reply@stan.store'
    }));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold mr-2">
              $
            </div>
            Stan Store Receipt Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="receipt-id">Receipt ID</Label>
            <Input
              id="receipt-id"
              value={formData.RECEIPT_ID}
              onChange={(e) => handleInputChange("RECEIPT_ID", e.target.value)}
              placeholder="1860-9282"
            />
          </div>

          <div>
            <Label htmlFor="buyer-name">Buyer Name</Label>
            <Input
              id="buyer-name"
              value={formData.BUYER_NAME}
              onChange={(e) => handleInputChange("BUYER_NAME", e.target.value)}
              placeholder="Enter buyer's name"
            />
          </div>

          <div>
            <Label htmlFor="product-name">Product Name</Label>
            <Input
              id="product-name"
              value={formData.PRODUCT_NAME}
              onChange={(e) => handleInputChange("PRODUCT_NAME", e.target.value)}
              placeholder="Enter product name"
            />
          </div>

          <div>
            <Label htmlFor="amount-paid">Amount Paid</Label>
            <Input
              id="amount-paid"
              value={formData.AMOUNT_PAID}
              onChange={(e) => handleInputChange("AMOUNT_PAID", e.target.value)}
              placeholder="$178.00"
            />
          </div>

          <div>
            <Label htmlFor="date-paid">Date Paid</Label>
            <Input
              id="date-paid"
              value={formData.DATE_PAID}
              onChange={(e) => handleInputChange("DATE_PAID", e.target.value)}
              placeholder="Mar 19, 2025, 4:03:08 AM"
            />
          </div>

          <div>
            <Label htmlFor="product-price">Product Price</Label>
            <Input
              id="product-price"
              value={formData.PRODUCT_PRICE}
              onChange={(e) => handleInputChange("PRODUCT_PRICE", e.target.value)}
              placeholder="$178.00"
            />
          </div>

          <div>
            <Label htmlFor="total-amount">Total Amount</Label>
            <Input
              id="total-amount"
              value={formData.TOTAL_AMOUNT}
              onChange={(e) => handleInputChange("TOTAL_AMOUNT", e.target.value)}
              placeholder="$178.00"
            />
          </div>

          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Input
              id="payment-method"
              value={formData.PAYMENT_METHOD}
              onChange={(e) => handleInputChange("PAYMENT_METHOD", e.target.value)}
              placeholder="MasterCard"
            />
          </div>

          <div>
            <Label htmlFor="card-last4">Card Last 4 Digits</Label>
            <Input
              id="card-last4"
              value={formData.CARD_LAST4}
              onChange={(e) => handleInputChange("CARD_LAST4", e.target.value)}
              placeholder="4961"
              maxLength={4}
            />
          </div>

          <div>
            <Label htmlFor="seller-email">Seller Email</Label>
            <Input
              id="seller-email"
              type="email"
              value={formData.SELLER_EMAIL}
              onChange={(e) => handleInputChange("SELLER_EMAIL", e.target.value)}
              placeholder="seller@example.com"
            />
          </div>

          <Button onClick={generateReceipt} className="w-full">
            Generate Receipt
          </Button>

          {generatedHTML && (
            <Link to="/send" onClick={sendToEmailPage}>
              <Button variant="secondary" className="w-full">
                <Mail className="w-4 h-4 mr-2" />
                Send Receipt via Email
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Receipt Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedHTML ? (
            <div className="border rounded-lg p-4 overflow-auto">
              <iframe
                srcDoc={generatedHTML}
                className="w-full h-[600px] border-0"
                title="Receipt Preview"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
              Fill out the form and click "Generate Receipt" to see preview
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StanStoreForm;