import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateReceiptHTML, getTemplateHTML } from "@/lib/templateUtils";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

const BeaconsForm = () => {
  const [formData, setFormData] = useState({
    SELLER_LOGO_URL: "",
    BUYER_NAME: "",
    PRODUCT_NAME: "",
    UNTITLED_URL: "",
    ACCESS_LINK: "",
    DATE: new Date().toLocaleDateString(),
    ORDER_ID: "",
    PRODUCT_IMAGE_URL: "",
    PRICE: "",
    CUSTOMER_PORTAL_URL: "",
    SELLER_NAME: ""
  });
  const [generatedHTML, setGeneratedHTML] = useState("");
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (field: string, file: File) => {
    try {
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      handleInputChange(field, objectUrl);
      
      toast({
        title: "File uploaded",
        description: "Image has been uploaded successfully"
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload image",
        variant: "destructive"
      });
    }
  };

  const generateReceipt = () => {
    const template = getTemplateHTML("beacons");
    const html = generateReceiptHTML(template, formData);
    setGeneratedHTML(html);
    toast({
      title: "Receipt generated",
      description: "Your Beacons.ai receipt is ready!"
    });
  };

  const sendToEmailPage = () => {
    // Store data in localStorage for the email page
    localStorage.setItem('receiptData', JSON.stringify({
      html: generatedHTML,
      platform: 'beacons',
      subject: 'Your Receipt from Beacons.ai',
      fromName: 'Beacons AI',
      fromEmail: 'no-reply@beacons.ai'
    }));
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <img src="https://beacons.ai/favicon.ico" alt="Beacons" className="w-6 h-6 mr-2" />
            Beacons.ai Receipt Form
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seller-logo">Seller Logo Image</Label>
            <Input
              id="seller-logo"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload("SELLER_LOGO_URL", file);
              }}
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
            <Label htmlFor="product-image">Product Image</Label>
            <Input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload("PRODUCT_IMAGE_URL", file);
              }}
            />
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              value={formData.PRICE}
              onChange={(e) => handleInputChange("PRICE", e.target.value)}
              placeholder="$0.00"
            />
          </div>

          <div>
            <Label htmlFor="order-id">Order ID</Label>
            <Input
              id="order-id"
              value={formData.ORDER_ID}
              onChange={(e) => handleInputChange("ORDER_ID", e.target.value)}
              placeholder="Enter order ID"
            />
          </div>

          <div>
            <Label htmlFor="access-link">Access Link</Label>
            <Input
              id="access-link"
              value={formData.ACCESS_LINK}
              onChange={(e) => handleInputChange("ACCESS_LINK", e.target.value)}
              placeholder="https://..."
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

export default BeaconsForm;