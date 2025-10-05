import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Edit, Mail, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { parseHTMLTemplate, generateReceiptHTML, TemplateField } from "@/lib/templateUtils";

interface ReceiptEditorProps {
  originalHTML?: string;
  onEditComplete?: (newHTML: string) => void;
}

const ReceiptEditor = ({ originalHTML, onEditComplete }: ReceiptEditorProps) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fields, setFields] = useState<TemplateField[]>([]);
  const [generatedHTML, setGeneratedHTML] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (originalHTML) {
      try {
        const parsed = parseHTMLTemplate(originalHTML);
        
        // Pre-fill form with extracted data
        const extractedData = extractDataFromHTML(originalHTML);
        setFormData(extractedData);
        
        // Create standard receipt fields
        const standardFields: TemplateField[] = [
          { key: 'BUYER_NAME', label: 'Buyer Name', type: 'text', placeholder: 'Enter buyer name' },
          { key: 'BUYER_EMAIL', label: 'Buyer Email', type: 'email', placeholder: 'buyer@example.com' },
          { key: 'PRODUCT_NAME', label: 'Product Name', type: 'text', placeholder: 'Enter product name' },
          { key: 'SELLER_NAME', label: 'Seller Name', type: 'text', placeholder: 'Enter seller name' },
          { key: 'PRICE', label: 'Price', type: 'text', placeholder: '$0.00' },
          { key: 'SUBTOTAL', label: 'Subtotal', type: 'text', placeholder: '$0.00' },
          { key: 'TOTAL', label: 'Total', type: 'text', placeholder: '$0.00' },
          { key: 'DATE', label: 'Date', type: 'date', placeholder: 'Select date' },
          { key: 'ORDER_ID', label: 'Order ID', type: 'text', placeholder: 'Order number' },
        ];
        
        // Add image fields if detected
        if (extractedData.SELLER_LOGO_URL) {
          standardFields.push({ key: 'SELLER_LOGO_URL', label: 'Logo/Seller Image URL', type: 'text', placeholder: 'https://example.com/logo.png' });
        }
        if (extractedData.PRODUCT_IMAGE_URL) {
          standardFields.push({ key: 'PRODUCT_IMAGE_URL', label: 'Product Image URL', type: 'text', placeholder: 'https://example.com/product.png' });
        }
        
        setFields(standardFields);
        
        // Set default email settings
        setFromName(extractedData.SELLER_NAME || "Store");
        setFromEmail("no-reply@store.com");
        setEmailSubject(`${extractedData.PRODUCT_NAME || "Your Receipt"} Confirmation`);
      } catch (error) {
        console.error('Error parsing HTML:', error);
        toast({
          title: "Error",
          description: "Failed to parse receipt HTML",
          variant: "destructive"
        });
      }
    }
  }, [originalHTML, toast]);

  const extractDataFromHTML = (html: string): Record<string, any> => {
    const data: Record<string, any> = {};
    
    // Enhanced extraction patterns
    const patterns = {
      BUYER_NAME: /(?:Name|Customer):\s*([^<\n]+)|Thanks for your order,?\s*([^!]+?)!/i,
      BUYER_EMAIL: /(?:Email):\s*(?:<a[^>]*>)?([^<\n]+@[^<\n]+)(?:<\/a>)?/i,
      PRODUCT_NAME: /<(?:strong|b|h[1-6])[^>]*>\s*([^<]+?)\s*<\/(?:strong|b|h[1-6])>/i,
      PRICE: /\$\s*([0-9,]+(?:\.[0-9]{2})?)/,
      SUBTOTAL: /Subtotal:?\s*\$\s*([0-9,]+(?:\.[0-9]{2})?)/i,
      TOTAL: /(?:Total|Order Total):?\s*\$\s*([0-9,]+(?:\.[0-9]{2})?)/i,
      DATE: /(?:Date|Order date):?\s*([0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4})/i,
      ORDER_ID: /(?:Order #|Receipt #|ID):?\s*([^<\n\s]+)/i,
      SELLER_NAME: /from\s+<(?:strong|b)>\s*([^<]+)\s*<\/(?:strong|b)>|purchasing\s+<(?:strong|b)>\s*([^<]+)\s*<\/(?:strong|b)>/i,
      ACCESS_LINK: /href="([^"]*access[^"]*)/i,
      CUSTOMER_PORTAL_URL: /href="([^"]*portal[^"]*)/i,
    };

    // Extract images
    const imgMatches = html.match(/<img[^>]+src="([^"]+)"[^>]*>/gi);
    if (imgMatches) {
      imgMatches.forEach((match, index) => {
        const srcMatch = match.match(/src="([^"]+)"/);
        if (srcMatch) {
          const src = srcMatch[1];
          // Detect image type based on context or alt text
          if (match.includes('logo') || match.includes('profile') || index === 0) {
            data.SELLER_LOGO_URL = src;
          } else if (match.includes('product') || index > 0) {
            data.PRODUCT_IMAGE_URL = src;
          }
        }
      });
    }

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = html.match(pattern);
      if (match) {
        // Some patterns have multiple capture groups, find the first non-empty one
        const value = match[1] || match[2];
        if (value) {
          data[key] = value.trim();
        }
      }
    });

    return data;
  };

  const handleInputChange = (key: string, value: string | File) => {
    if (value instanceof File) {
      // Convert file to base64 for email compatibility
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({
          ...prev,
          [key]: base64String
        }));
      };
      reader.readAsDataURL(value);
    } else {
      setFormData(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  const handleGenerate = async () => {
    if (!originalHTML) return;

    setLoading(true);
    try {
      let newHTML = originalHTML;
      const extractedData = extractDataFromHTML(originalHTML);
      
      // Replace images first
      if (formData.SELLER_LOGO_URL && extractedData.SELLER_LOGO_URL) {
        newHTML = newHTML.replace(extractedData.SELLER_LOGO_URL, formData.SELLER_LOGO_URL);
      }
      if (formData.PRODUCT_IMAGE_URL && extractedData.PRODUCT_IMAGE_URL) {
        newHTML = newHTML.replace(extractedData.PRODUCT_IMAGE_URL, formData.PRODUCT_IMAGE_URL);
      }
      
      // Replace text values
      Object.entries(formData).forEach(([key, value]) => {
        if (value && !key.includes('URL')) {
          const oldValue = extractedData[key];
          if (oldValue && typeof oldValue === 'string') {
            // Replace all occurrences of the old value with new value
            const regex = new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            newHTML = newHTML.replace(regex, value);
          }
        }
      });
      
      setGeneratedHTML(newHTML);
      
      toast({
        title: "Success",
        description: "Receipt updated successfully!",
      });

      if (onEditComplete) {
        onEditComplete(newHTML);
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      toast({
        title: "Error",
        description: "Failed to generate receipt",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleSendReceipt = () => {
    if (!generatedHTML) return;

    // Store the generated receipt for sending
    localStorage.setItem('receiptData', JSON.stringify({
      html: generatedHTML,
      subject: emailSubject,
      fromName: fromName,
      fromEmail: fromEmail,
    }));
    
    navigate('/send-receipt');
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <header className="bg-gradient-primary text-primary-foreground py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/custom-templates">
            <Button variant="ghost" className="text-primary-foreground hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Edit Receipt</h1>
          <p className="text-xl opacity-90">Modify receipt details and generate updated version</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Edit className="w-5 h-5 mr-2" />
                Edit Receipt Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div key={index}>
                  <Label htmlFor={field.key}>{field.label}</Label>
                  {field.type === "file" ? (
                    <Input
                      id={field.key}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          handleInputChange(field.key, url);
                        }
                      }}
                    />
                  ) : (
                    <Input
                      id={field.key}
                      type={field.type}
                      value={formData[field.key] || ""}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                    />
                  )}
                </div>
              ))}
              
              <div className="border-t pt-4 mt-6 space-y-4">
                <h3 className="font-semibold text-lg">Email Settings</h3>
                
                <div>
                  <Label htmlFor="emailSubject">Subject Line</Label>
                  <Input
                    id="emailSubject"
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Sender name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="sender@example.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <Button 
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Receipt"
                  )}
                </Button>
                
                {generatedHTML && (
                  <Button 
                    onClick={handleSendReceipt}
                    variant="outline"
                    className="w-full"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Send Receipt via Email
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Receipt Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {generatedHTML ? (
                <div className="border rounded-lg overflow-hidden">
                  <iframe
                    srcDoc={generatedHTML}
                    className="w-full h-[600px] border-0"
                    title="Receipt Preview"
                  />
                </div>
              ) : originalHTML ? (
                <div>
                  <div className="border rounded-lg overflow-hidden mb-4">
                    <iframe
                      srcDoc={originalHTML}
                      className="w-full h-[600px] border-0"
                      title="Original Receipt"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Original receipt - fill the form and click "Generate Receipt" to see the updated version
                  </p>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
                  No receipt to preview
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReceiptEditor;