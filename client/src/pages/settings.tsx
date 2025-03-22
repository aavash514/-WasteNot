import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Bell, UserCircle, LockKeyhole, ShieldCheck, LogOut, Upload, Camera, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/Header";
import SideNav from "@/components/layout/SideNav";
import MobileNav from "@/components/layout/MobileNav";
import { ROUTES, DEFAULT_AVATAR } from "@/lib/constants";
import useAuth from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Form validation schemas
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function Settings() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [appNotifications, setAppNotifications] = useState(true);
  
  // Profile picture upload
  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("avatar", file);
      
      return apiRequest<{ avatarUrl: string }>({
        url: `/api/users/${user?.id}/avatar`,
        method: "POST",
        body: formData,
        headers: {
          // Don't set Content-Type here, it will be set automatically with boundary for FormData
        },
      });
    },
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Profile Picture Updated",
          description: "Your profile picture has been updated successfully",
        });
        // Invalidate user cache to refresh the avatar
        queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate(ROUTES.LOGIN);
    }
  }, [user, navigate]);
  
  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      username: user?.username || "",
    },
  });
  
  // Password form
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Handle profile form submission
  const onProfileSubmit = (values: z.infer<typeof profileFormSchema>) => {
    // In a real implementation, this would make an API call to update the user profile
    toast({
      title: "Profile Updated",
      description: "Your profile information has been updated successfully",
    });
  };
  
  // Handle password form submission
  const onPasswordSubmit = (values: z.infer<typeof passwordFormSchema>) => {
    // In a real implementation, this would make an API call to update the password
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully",
    });
    
    passwordForm.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };
  
  if (!user) return null;
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="md:flex md:space-x-6">
          <SideNav />
          
          <div className="flex-1">
            {/* Mobile header */}
            <div className="md:hidden flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-heading font-bold text-gray-900">Settings</h1>
                <p className="text-sm text-gray-500">Manage your account preferences</p>
              </div>
            </div>
            
            {/* Desktop header */}
            <div className="hidden md:block mb-6">
              <h1 className="text-2xl font-heading font-bold text-gray-900">Settings</h1>
              <p className="text-gray-500">Manage your account and app preferences</p>
            </div>
            
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="profile" className="flex items-center">
                  <UserCircle className="h-4 w-4 mr-2" />
                  <span>Profile</span>
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center">
                  <LockKeyhole className="h-4 w-4 mr-2" />
                  <span>Security</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center">
                  <Bell className="h-4 w-4 mr-2" />
                  <span>Notifications</span>
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Settings */}
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>
                      Update your personal details and public profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6 flex flex-col items-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={user.avatarUrl || DEFAULT_AVATAR} alt={user.name} />
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => fileInputRef.current?.click()}
                          disabled={avatarMutation.isPending}
                          className="flex items-center"
                        >
                          {avatarMutation.isPending ? (
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          ) : (
                            <Upload className="h-4 w-4 mr-2" />
                          )}
                          Change Photo
                        </Button>
                        
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              avatarMutation.mutate(file);
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="bg-primary hover:bg-primary/90">
                          Save Changes
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Account Management</CardTitle>
                    <CardDescription>
                      Manage your WasteNot account settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => logout()}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Log Out</span>
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security Settings */}
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>
                      Update your account password
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button type="submit" className="bg-primary hover:bg-primary/90">
                          Update Password
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
                
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                    <CardDescription>
                      Additional security settings for your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Secure your account</div>
                        <div className="text-sm text-muted-foreground">
                          We recommend adding additional security measures to protect your account
                        </div>
                      </div>
                      <ShieldCheck className="h-5 w-5 text-green-500" />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="font-medium">Privacy settings</div>
                        <div className="text-sm text-muted-foreground">
                          Control how your information is shared within the app
                        </div>
                      </div>
                      <Button variant="outline" size="sm">Manage</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Notification Settings */}
              <TabsContent value="notifications">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Choose how and when you want to be notified
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Email Notifications</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Weekly Summaries</div>
                          <div className="text-sm text-muted-foreground">
                            Receive weekly progress reports and meal tracking summaries
                          </div>
                        </div>
                        <Switch 
                          checked={emailNotifications} 
                          onCheckedChange={setEmailNotifications} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Reward Notifications</div>
                          <div className="text-sm text-muted-foreground">
                            Be notified when you've earned new rewards or badges
                          </div>
                        </div>
                        <Switch 
                          checked={emailNotifications} 
                          onCheckedChange={setEmailNotifications} 
                        />
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <h3 className="text-lg font-medium">App Notifications</h3>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Meal Reminders</div>
                          <div className="text-sm text-muted-foreground">
                            Receive reminders to track your meals
                          </div>
                        </div>
                        <Switch 
                          checked={appNotifications} 
                          onCheckedChange={setAppNotifications} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="font-medium">Activity Updates</div>
                          <div className="text-sm text-muted-foreground">
                            Get updates on upcoming sustainability activities
                          </div>
                        </div>
                        <Switch 
                          checked={appNotifications} 
                          onCheckedChange={setAppNotifications} 
                        />
                      </div>
                    </div>
                    
                    <Button className="bg-primary hover:bg-primary/90">
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
}
