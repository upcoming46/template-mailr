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
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (originalHTML) {
      try {
        const parsed = parseHTMLTemplate(originalHTML);
        setFields(parsed.fields);
        
        // Pre-fill form with extracted data
        const extractedData = extractDataFromHTML(originalHTML);
        setFormData(extractedData);
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
    
    // Simple extraction - look for common patterns
    const patterns = {
      BUYER_NAME: /Thanks for your order,?\s*([^!]+?)!/,
      PRODUCT_NAME: /<(?:strong|b)>\s*([^<]+)\s*<\/(?:strong|b)>/,
      AMOUNT_PAID: /\$(\d+(?:\.\d{2})?)/,
      DATE_PAID: /(?:Date paid|Order date):\s*([^<\n]+)/,
      RECEIPT_ID: /#(\w+\-?\w*)/,
      SELLER_EMAIL: /mailto:([^"'>]+)/,
    };

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = html.match(pattern);
      if (match) {
        data[key] = match[1].trim();
      }
    });

    return data;
  };

  const handleInputChange = (key: string, value: string | File) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGenerate = async () => {
    if (!originalHTML) return;

    setLoading(true);
    try {
      const newHTML = generateReceiptHTML(originalHTML, formData);
      setGeneratedHTML(newHTML);
      
      toast({
        title: "Success",
        description: "Receipt generated successfully!",
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
      subject: `Receipt from ${formData.SELLER_NAME || 'Your Purchase'}`,
      fromName: formData.SELLER_NAME || 'Store',
      fromEmail: formData.SELLER_EMAIL || 'no-reply@store.com',
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