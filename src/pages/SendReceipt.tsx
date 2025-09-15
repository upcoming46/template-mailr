import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Mail, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const SendReceipt = () => {
  const [emailData, setEmailData] = useState({
    recipientEmail: "",
    subject: "",
    fromName: "",
    fromEmail: "",
    html: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load receipt data from localStorage
    const storedData = localStorage.getItem('receiptData');
    if (storedData) {
      const receiptData = JSON.parse(storedData);
      setEmailData(prev => ({
        ...prev,
        subject: receiptData.subject || "Your Receipt",
        fromName: receiptData.fromName || "Receipt Generator",
        fromEmail: receiptData.fromEmail || "no-reply@example.com",
        html: receiptData.html || ""
      }));
    }
  }, []);

  const handleSendEmail = async () => {
    if (!emailData.recipientEmail || !emailData.subject || !emailData.html) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
    const response = await fetch('/.netlify/functions/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.recipientEmail,
        subject: emailData.subject,
        fromName: emailData.fromName,
        fromEmail: emailData.fromEmail,
        html: emailData.html
      })
    });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      toast({
        title: "Success!",
        description: "Receipt sent successfully to " + emailData.recipientEmail,
      });

      // Clear the stored receipt data
      localStorage.removeItem('receiptData');
    } catch (error) {
      console.error('Email send error:', error);
      toast({
        title: "Error",
        description: "Failed to send email. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
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
                  value={emailData.recipientEmail}
                  onChange={(e) => setEmailData(prev => ({ ...prev, recipientEmail: e.target.value }))}
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
                disabled={loading || !emailData.html}
                className="w-full"
              >
                {loading ? (
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

              {!emailData.html && (
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
              {emailData.html ? (
                <div className="space-y-4">
                  <div className="p-3 bg-muted rounded">
                    <p className="text-sm"><strong>To:</strong> {emailData.recipientEmail || "customer@example.com"}</p>
                    <p className="text-sm"><strong>From:</strong> {emailData.fromName || "Your Business"} &lt;{emailData.fromEmail || "no-reply@example.com"}&gt;</p>
                    <p className="text-sm"><strong>Subject:</strong> {emailData.subject || "Your Receipt"}</p>
                  </div>
                  <div className="border rounded-lg p-4 max-h-96 overflow-auto">
                    <iframe
                      srcDoc={emailData.html}
                      className="w-full h-96 border-0"
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