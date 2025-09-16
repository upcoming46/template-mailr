import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";

const EmailSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear localStorage after successful email send
    localStorage.removeItem('receiptData');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-elegant">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Email Sent Successfully!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Mail className="w-5 h-5" />
            <span>Your receipt has been delivered</span>
          </div>
          
          <p className="text-muted-foreground">
            The receipt has been successfully sent to the recipient's email address. 
            They should receive it within a few minutes.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => navigate("/templates")} 
              className="w-full"
              variant="default"
            >
              Create Another Receipt
            </Button>
            
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailSuccess;