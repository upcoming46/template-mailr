import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import BeaconsForm from "@/components/forms/BeaconsForm";
import StanStoreForm from "@/components/forms/StanStoreForm";
import FanbasisForm from "@/components/forms/FanbasisForm";

const Templates = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: "beacons",
      name: "Beacons.ai",
      description: "Modern dark theme with seller logo and product images",
      color: "bg-gradient-primary",
      features: ["Seller Logo Upload", "Product Images", "Customer Portal Links"]
    },
    {
      id: "stanstore", 
      name: "Stan Store",
      description: "Professional purple theme with payment method display",
      color: "bg-gradient-secondary",
      features: ["Payment Method Display", "Receipt ID", "Support Links"]
    },
    {
      id: "fanbasis",
      name: "Fanbasis",
      description: "Clean yellow and dark theme for digital courses",
      color: "bg-gradient-success",
      features: ["Order Summary", "Seller Information", "Course Details"]
    }
  ];

  if (selectedTemplate) {
    return (
      <div className="min-h-screen bg-gradient-bg p-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => setSelectedTemplate(null)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Templates
          </Button>
          
          {selectedTemplate === "beacons" && <BeaconsForm />}
          {selectedTemplate === "stanstore" && <StanStoreForm />}
          {selectedTemplate === "fanbasis" && <FanbasisForm />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-bg">
      <header className="bg-gradient-primary text-primary-foreground py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="text-primary-foreground hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Choose Your Template</h1>
          <p className="text-xl opacity-90">Select from professional receipt templates</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {templates.map((template) => (
            <Card key={template.id} className="shadow-card hover:shadow-elegant transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className={`w-full h-32 ${template.color} rounded-lg mb-4 flex items-center justify-center`}>
                  <span className="text-2xl font-bold text-white">{template.name}</span>
                </div>
                <CardTitle className="text-xl">{template.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{template.description}</p>
                <div className="space-y-2 mb-6">
                  {template.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {feature}
                    </Badge>
                  ))}
                </div>
                <Button 
                  onClick={() => setSelectedTemplate(template.id)}
                  className="w-full"
                >
                  Use This Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Templates;