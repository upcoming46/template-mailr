import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { sendEmail } from "@/lib/api";

const SendReceipt = () => {
  const [emailData, setEmailData] = useState({
    to: "customer@example.com",
    subject: "Your Receipt from Beacons.ai", 
    fromName: "Beacons AI",
    fromEmail: "no-reply@beacons.ai",
  });
  const [htmlContent, setHtmlContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Load receipt data from localStorage
    const storedData = localStorage.getItem('receiptData');
    if (storedData) {
      const receiptData = JSON.parse(storedData);
      // Determine email settings based on template type
      let defaultSettings = {
        subject: "Your Receipt from Beacons.ai",
        fromName: "Beacons AI", 
        fromEmail: "no-reply@beacons.ai"
      };
      
      if (receiptData.html?.includes('stan.store') || receiptData.html?.includes('Stan Store')) {
        defaultSettings = {
          subject: "Receipt from Stan - Your Creator Store",
          fromName: "Stan Store",
          fromEmail: "no-reply@stan.store"
        };
      } else if (receiptData.html?.includes('fanbasis') || receiptData.html?.includes('Fanbasis')) {
        defaultSettings = {
          subject: "Payment Confirmation - Your Order Receipt", 
          fromName: "Fanbasis",
          fromEmail: "no-reply@fanbasis.com"
        };
      }
      
      setEmailData(prev => ({
        ...prev,
        subject: receiptData.subject || defaultSettings.subject,
        fromName: receiptData.fromName || defaultSettings.fromName,
        fromEmail: receiptData.fromEmail || defaultSettings.fromEmail,
      }));
      setHtmlContent(receiptData.html || "");
    }
  }, []);

  const handleSendEmail = async () => {
    if (!emailData.to || !emailData.subject || !htmlContent) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.to)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      console.log('Sending email to:', emailData.to);
      await sendEmail({
        to: emailData.to,
        subject: emailData.subject,
        fromName: emailData.fromName,
        fromEmail: emailData.fromEmail,
        html: htmlContent,
      });

      toast({
        title: "Email sent successfully!",
        description: `Receipt sent to ${emailData.to}`,
      });

      // Redirect to success page
      navigate("/email-success");
    } catch (error) {
      console.error('Email send error:', error);
      
      // Provide more detailed error feedback
      let errorMessage = "Failed to send email. Please try again.";
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message.includes('invalid') || error.message.includes('not found')) {
          errorMessage = "Invalid email address or email service issue.";
        }
      }
      
      toast({
        title: "Error", 
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <header className="bg-gradient-success text-success-foreground py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/templates">
            <Button variant="ghost" className="text-success-foreground hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Send Receipt</h1>
          <p className="text-xl opacity-90">Email the receipt to your customer</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipient-email">Recipient Email *</Label>
                <Input
                  id="recipient-email"
                  type="email"
                  value={emailData.to}
                  onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="customer@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={emailData.subject}
                  onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Your Receipt"
                  required
                />
              </div>

              <div>
                <Label htmlFor="from-name">From Name</Label>
                <Input
                  id="from-name"
                  value={emailData.fromName}
                  onChange={(e) => setEmailData(prev => ({ ...prev, fromName: e.target.value }))}
                  placeholder="Your Business Name"
                />
              </div>

              <div>
                <Label htmlFor="from-email">From Email</Label>
                <Input
                  id="from-email"
                  type="email"
                  value={emailData.fromEmail}
                  onChange={(e) => setEmailData(prev => ({ ...prev, fromEmail: e.target.value }))}
                  placeholder="no-reply@yourbusiness.com"
                />
              </div>

              <Button 
                onClick={handleSendEmail}
                disabled={isSending || !htmlContent}
                className="w-full"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Receipt
                  </>
                )}
              </Button>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> If emails are not being delivered, you may need to verify your domain at{" "}
                  <a 
                    href="https://resend.com/domains" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    resend.com/domains
                  </a>{" "}
                  for reliable email delivery.
                </p>
              </div>

              {!htmlContent && (
                <p className="text-sm text-muted-foreground">
                  No receipt found. Please generate a receipt first from the templates page.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {htmlContent ? (
                <div className="space-y-4">
                  <div className="p-4 bg-muted rounded-lg border">
                    <h3 className="font-semibold mb-2">Email Preview</h3>
                    <p className="text-sm"><strong>To:</strong> {emailData.to}</p>
                    <p className="text-sm"><strong>From:</strong> {emailData.fromName} &lt;{emailData.fromEmail}&gt;</p>
                    <p className="text-sm"><strong>Subject:</strong> {emailData.subject}</p>
                  </div>
                  <div className="border rounded-lg p-4 overflow-auto">
                    <iframe
                      srcDoc={htmlContent}
                      className="w-full h-[500px] border-0"
                      title="Email Preview"
                    />
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
                  No receipt to preview. Generate a receipt first.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SendReceipt;