import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Receipt, Mail, Upload, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-bg">
      <header className="bg-gradient-primary text-primary-foreground py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Receipt Generator Pro
          </h1>
          <p className="text-xl md:text-2xl opacity-90">
            Create professional receipts and send them via email instantly
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="shadow-card hover:shadow-elegant transition-all duration-300 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Receipt className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Platform Templates</h3>
              <p className="text-muted-foreground mb-6">
                Use pre-built templates from Beacons.ai, Stan Store, and Fanbasis
              </p>
              <Link to="/templates">
                <Button variant="default" className="w-full">
                  Choose Template
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all duration-300 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Custom Templates</h3>
              <p className="text-muted-foreground mb-6">
                Create your own templates by pasting HTML or uploading images
              </p>
              <Link to="/custom">
                <Button variant="secondary" className="w-full">
                  Create Custom
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-card hover:shadow-elegant transition-all duration-300 group">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Mail className="w-8 h-8 text-success-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Send Receipts</h3>
              <p className="text-muted-foreground mb-6">
                Email receipts directly to customers with professional formatting
              </p>
              <Link to="/send">
                <Button variant="outline" className="w-full">
                  Send Email
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Choose Template</h3>
              <p className="text-muted-foreground">Select from our professional templates or create your own</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Fill Details</h3>
              <p className="text-muted-foreground">Enter buyer information, prices, and customize the receipt</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Send Email</h3>
              <p className="text-muted-foreground">Email the receipt directly to your customer's inbox</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;