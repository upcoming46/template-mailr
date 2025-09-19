import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Code, Upload, Loader2, Edit } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { parseHTMLTemplate, processImageToHTML } from "@/lib/templateUtils";

const CustomTemplates = () => {
  const [activeTab, setActiveTab] = useState<"html" | "image">("html");
  const [htmlContent, setHtmlContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedTemplate, setParsedTemplate] = useState<any>(null);
  const { toast } = useToast();

  const handleHTMLSubmit = async () => {
    if (!htmlContent.trim()) {
      toast({
        title: "Error",
        description: "Please paste HTML content first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const parsed = parseHTMLTemplate(htmlContent);
      setParsedTemplate(parsed);
      toast({
        title: "Success",
        description: "HTML template parsed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to parse HTML template",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please upload a valid image file",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const result = await processImageToHTML(file);
      setParsedTemplate(result);
      toast({
        title: "Success",
        description: "Image processed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <header className="bg-gradient-secondary text-accent-foreground py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Link to="/">
            <Button variant="ghost" className="text-accent-foreground hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2">Custom Templates</h1>
          <p className="text-xl opacity-90">Create templates from HTML or images</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              activeTab === "html" ? "ring-2 ring-primary shadow-elegant" : "shadow-card hover:shadow-elegant"
            }`}
            onClick={() => setActiveTab("html")}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="w-5 h-5 mr-2" />
                Paste HTML
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Paste your HTML receipt template and we'll automatically detect editable fields
              </p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-300 ${
              activeTab === "image" ? "ring-2 ring-primary shadow-elegant" : "shadow-card hover:shadow-elegant"
            }`}
            onClick={() => setActiveTab("image")}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Upload a receipt image and we'll convert it to HTML with editable fields
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-6">
            {activeTab === "html" ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Paste HTML Template</h3>
                <Textarea
                  placeholder="Paste your HTML receipt template here..."
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  className="min-h-[300px] font-mono text-sm"
                />
                <Button 
                  onClick={handleHTMLSubmit}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Parse HTML Template"
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Upload Receipt Image</h3>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg mb-2">Drop your receipt image here or click to browse</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Supports JPG, PNG, WEBP up to 10MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={loading}
                  />
                  <label htmlFor="image-upload">
                    <Button variant="outline" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Choose File"
                      )}
                    </Button>
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {parsedTemplate && (
          <Card className="shadow-card mt-8">
            <CardHeader>
              <CardTitle>Template Preview & Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Preview:</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <iframe
                      srcDoc={parsedTemplate.html}
                      className="w-full h-[400px] border-0"
                      title="Template Preview"
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Detected Fields: {parsedTemplate.fields?.length || 0}</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {parsedTemplate.fields?.map((field: any, index: number) => (
                      <div key={index} className="bg-muted p-2 rounded text-sm">
                        {field.label}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => {
                      // Store parsed template for editing
                      localStorage.setItem('editReceiptData', JSON.stringify({
                        html: parsedTemplate.html,
                        fields: parsedTemplate.fields
                      }));
                      // Navigate to receipt editor
                      window.location.href = '/receipt-editor';
                    }}
                    className="w-full"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Receipt
                  </Button>
                  
                  <Button variant="outline" className="w-full">
                    Save as Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default CustomTemplates;