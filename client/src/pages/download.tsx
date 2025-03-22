import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

export default function DownloadPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl">Download Source Code</CardTitle>
          <CardDescription>
            Get the WasteNot project source code as a zip file
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-sm text-gray-600">
            This file contains all the essential code for the WasteNot application, including 
            client and server components, without the node_modules folder.
          </p>
          
          <Button 
            className="w-full flex items-center justify-center gap-2"
            onClick={() => {
              window.location.href = "/api/download/source-code";
            }}
          >
            <Download className="h-4 w-4" />
            Download Source Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}