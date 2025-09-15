import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { generateReceiptHTML, getTemplateHTML } from "@/lib/templateUtils";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const FanbasisForm = () => {
  const [formData, setFormData] = useState({
    PRODUCT_NAME: "",
    SELLER_NAME: "",
    BUYER_NAME: "",
    BUYER_EMAIL: "",
    DATE: new Date().toLocaleDateString(),
    PRICE: "",
    SUBTOTAL: "",
    TOTAL: ""
  });
  const [generatedHTML, setGeneratedHTML] = useState("");
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateReceipt = () => {
    const template = getTemplateHTML("fanbasis");
    const html = generateReceiptHTML(template, formData);
    setGeneratedHTML(html);
    toast({
      title: "Receipt generated",
      description: "Your Fanbasis receipt is ready!"
    });
  };

  const sendToEmailPage = () => {
    localStorage.setItem('receiptData', JSON.stringify({
      html: generatedHTML,
      platform: 'fanbasis',
      subject: 'Payment Confirmation - Your Order Receipt',
      fromName: 'Fanbasis',
      fromEmail: 'no-reply@fanbasis.com'
    }));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="w-6 h-6 bg-warning rounded-full flex items-center justify-center text-warning-foreground text-sm font-bold mr-2">
              F
            </div>
            Fanbasis Receipt Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="buyer-email">Buyer Email</Label>
            <Input
              id="buyer-email"
              type="email"
              value={formData.BUYER_EMAIL}
              onChange={(e) => handleInputChange("BUYER_EMAIL", e.target.value)}
              placeholder="buyer@example.com"
            />
          </div>

          <div>
            <Label htmlFor="seller-name">Seller Name</Label>
            <Input
              id="seller-name"
              value={formData.SELLER_NAME}
              onChange={(e) => handleInputChange("SELLER_NAME", e.target.value)}
              placeholder="Enter seller name"
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
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              value={formData.PRICE}
              onChange={(e) => handleInputChange("PRICE", e.target.value)}
              placeholder="$444.00"
            />
          </div>

          <div>
            <Label htmlFor="subtotal">Subtotal</Label>
            <Input
              id="subtotal"
              value={formData.SUBTOTAL}
              onChange={(e) => handleInputChange("SUBTOTAL", e.target.value)}
              placeholder="$444.00"
            />
          </div>

          <div>
            <Label htmlFor="total">Total</Label>
            <Input
              id="total"
              value={formData.TOTAL}
              onChange={(e) => handleInputChange("TOTAL", e.target.value)}
              placeholder="$444.00"
            />
          </div>

          <div>
            <Label htmlFor="date">Order Date</Label>
            <Input
              id="date"
              value={formData.DATE}
              onChange={(e) => handleInputChange("DATE", e.target.value)}
              placeholder="09/12/2025"
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
            <div className="border rounded-lg p-4 max-h-96 overflow-auto">
              <iframe
                srcDoc={generatedHTML}
                className="w-full h-96 border-0"
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

export default FanbasisForm;