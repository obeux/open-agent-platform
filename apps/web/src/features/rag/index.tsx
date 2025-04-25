"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { AgentsCombobox } from "@/components/ui/agents-combobox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getDeployments } from "@/lib/environment/deployments";
import {
    FileUp,
    Trash2,
    Info,
    Search,
    FileText,
    Bookmark,
    Settings
} from "lucide-react";

/**
 * Interface for document data
 */
interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  created: string;
  agent: string;
}

/**
 * The parent component containing the RAG interface.
 */
export default function RAGInterface(): React.ReactNode {
  const [selectedAgent, setSelectedAgent] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isAgentSelectorOpen, setIsAgentSelectorOpen] = useState(false);
  
  // Mock data for UI demonstration
  const mockDocuments: Document[] = [
    {
      id: "1",
      name: "product-documentation.pdf",
      size: "2.4 MB",
      type: "PDF",
      created: "2023-06-15",
      agent: "Support Agent"
    },
    {
      id: "2",
      name: "customer-feedback.docx",
      size: "1.8 MB",
      type: "DOCX",
      created: "2023-06-14",
      agent: "Feedback Analysis"
    },
    {
      id: "3",
      name: "research-paper.pdf",
      size: "5.1 MB",
      type: "PDF",
      created: "2023-06-10",
      agent: "Research Assistant"
    }
  ];

  const handleFileUpload = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploadDialogOpen(false);
    toast.success("Document uploaded", {
      description: "Your document has been uploaded and is being processed."
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="agents">
            <Settings className="mr-2 h-4 w-4" />
            RAG Agents
          </TabsTrigger>
          <TabsTrigger value="configuration">
            <Info className="mr-2 h-4 w-4" />
            Configuration
          </TabsTrigger>
        </TabsList>
        
        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Document Management</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search documents..." 
                  className="pl-8 w-[250px]" 
                />
              </div>
              <AgentsCombobox
                agents={[]} // You'll need to fetch agents here
                placeholder="Filter by agent"
                open={isAgentSelectorOpen}
                setOpen={setIsAgentSelectorOpen}
                value={selectedAgent}
                setValue={setSelectedAgent}
              />
              <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Documents</DialogTitle>
                    <DialogDescription>
                      Upload documents to be indexed and used by RAG agents.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleFileUpload}>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="agent">Select RAG Agent</Label>
                        <AgentsCombobox
                          agents={[]} // You'll need to fetch agents here
                          placeholder="Select an agent"
                          value={selectedAgent}
                          setValue={setSelectedAgent}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="file">Upload Files</Label>
                        <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50">
                          <FileUp className="mx-auto h-8 w-8 text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Drag and drop files here or click to browse
                          </p>
                          <Input 
                            id="file" 
                            type="file" 
                            multiple 
                            className="hidden" 
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="mt-4">
                      <Button type="submit">Upload and Process</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-250px)]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date Added</TableHead>
                      <TableHead>Agent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockDocuments.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium">{doc.name}</TableCell>
                        <TableCell>{doc.size}</TableCell>
                        <TableCell>{doc.type}</TableCell>
                        <TableCell>{doc.created}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{doc.agent}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Document</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete this document? This will remove it from the vector store.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* RAG Agents Tab */}
        <TabsContent value="agents" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">RAG Agents</h2>
            <Button>
              <Bookmark className="mr-2 h-4 w-4" />
              Create RAG Agent
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getDeployments().slice(0, 3).map((deployment, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {deployment.name}
                    <Badge className="ml-2">RAG</Badge>
                  </CardTitle>
                  <CardDescription>
                    Deployment ID: {deployment.id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Documents:</span>
                      <span className="font-medium">{Math.floor(Math.random() * 10)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Indexed on:</span>
                      <span className="font-medium">June 15, 2023</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Storage:</span>
                      <span className="font-medium">PGVector</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" size="sm">Manage</Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="mr-2 h-4 w-4 text-destructive" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          <h2 className="text-2xl font-bold">RAG Configuration</h2>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">RAG Agent Requirements</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium">1. Add custom indexing routes</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your graph must implement the following endpoints:
                </p>
                <div className="bg-muted rounded-md p-3 mt-2">
                  <code className="text-sm">
                    <p><span className="text-blue-500">POST</span> /rag/ingest - Accepts documents for indexing</p>
                    <p><span className="text-red-500">DELETE</span> /rag/delete - Removes documents from the store</p>
                    <p><span className="text-green-500">GET</span> /rag/retrieve - Retrieves relevant documents</p>
                  </code>
                </div>
              </div>
              
              <div>
                <h4 className="text-md font-medium">2. Add custom configurable fields</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Your graph must include context about documents in the store
                </p>
                <div className="bg-muted rounded-md p-3 mt-2">
                  <code className="text-sm">
                    Example configuration for PGVector storage
                  </code>
                </div>
              </div>
            </div>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Implementation Details</CardTitle>
              <CardDescription>
                Technical specifications for RAG implementation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Vector Store</h4>
                <p className="text-sm text-muted-foreground">Using PGVector as external store for document embeddings</p>
              </div>
              <div>
                <h4 className="font-medium">Indexing</h4>
                <p className="text-sm text-muted-foreground">Standardized custom endpoint for document ingestion</p>
              </div>
              <div>
                <h4 className="font-medium">Agent Template</h4>
                <p className="text-sm text-muted-foreground">Standalone RAG graph template based on ReAct with additional endpoints for ingestion</p>
              </div>
              <div>
                <h4 className="font-medium">Integration</h4>
                <p className="text-sm text-muted-foreground">Works with any messages-based agent with custom configuration for document access</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
