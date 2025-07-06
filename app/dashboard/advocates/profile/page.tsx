"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User, Mail, Phone, Building, Shield, Calendar, Save, Upload, Eye, EyeOff, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
});

// Password change schema
const passwordChangeSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  image?: string;
  roles: string[];
  isActive: boolean;
  emailVerified: boolean;
  hasPassword?: boolean;
  subscription?: {
    plan: string;
    status: string;
    startDate: string;
    endDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      companyName: '',
    },
  });

  // Password change form
  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Handle URL parameters and password setup
  useEffect(() => {
    const tab = searchParams.get('tab');
    const setup = searchParams.get('setup');
    
    if (tab) {
      setActiveTab(tab);
    }
    
    if (setup === 'password') {
      setShowPasswordSetup(true);
    }
  }, [searchParams]);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
          setHasPassword(!!data.hasPassword); // Check if user has a password
          profileForm.reset({
            name: data.name,
            email: data.email,
            phone: data.phone || '',
            companyName: data.companyName || '',
          });
        } else {
          toast.error('Failed to load profile');
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Error loading profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchProfile();
    }
  }, [session, profileForm]);

  // Handle profile update
  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setUserProfile(updatedProfile);
        toast.success('Profile updated successfully');
        await update();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password change
  const onPasswordSubmit = async (data: PasswordChangeValues) => {
    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: hasPassword ? data.currentPassword : undefined,
          newPassword: data.newPassword,
        }),
      });

      if (response.ok) {
        toast.success('Password changed successfully');
        passwordForm.reset();
        setPasswordSuccess(true);
        setShowPasswordSetup(false);
        
        // Re-fetch profile data to get updated hasPassword state
        const profileResponse = await fetch('/api/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          setHasPassword(!!profileData.hasPassword);
        }
        
        // Redirect to dashboard after successful password set
        setTimeout(() => {
          router.push('/dashboard/advocates');
        }, 2000);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error changing password');
    }
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImageUploading(true);
    setImageError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        
        setUserProfile(prev => prev ? { ...prev, image: data.imageUrl } : null);
        toast.success('Profile picture updated');
        
        // Force session refresh to update sidebar and all components
        await update();
        
        // Additional delay to ensure session is fully updated
        setTimeout(async () => {
          await update();
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error uploading image';
      setImageError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsImageUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  // Handle image removal
  const handleImageRemove = async () => {
    if (!userProfile?.image) return;

    setIsImageUploading(true);
    setImageError('');

    try {
      const response = await fetch('/api/profile/avatar', {
        method: 'DELETE',
      });

      if (response.ok) {
        // Update local state to remove image
        setUserProfile(prev => prev ? { ...prev, image: undefined } : null);
        toast.success('Profile picture removed');
        
        // Force session refresh to update sidebar and all components
        await update();
        
        // Additional delay to ensure session is fully updated
        setTimeout(async () => {
          await update();
        }, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove image');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error removing image';
      setImageError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsImageUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Password Setup Prompt */}
      {showPasswordSetup && !hasPassword && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">
                  Set Up Your Password
                </h3>
                <p className="text-orange-700 mb-4">
                  To enable email/password login and secure your account, please set a password for your account.
                </p>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => setActiveTab('security')}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Set Password Now
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPasswordSetup(false)}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    Remind Me Later
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Update your profile picture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage 
                      src={userProfile?.image} 
                      alt={userProfile?.name}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <AvatarFallback className="text-lg">
                      {userProfile?.name?.split(' ').map(n => n.charAt(0)).join('').toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  {imageError && (
                    <div className="text-sm text-red-600 text-center max-w-xs">
                      {imageError}
                    </div>
                  )}
                  
                  <div className="flex flex-col items-center space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      disabled={isImageUploading}
                    >
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {isImageUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </>
                        )}
                      </label>
                    </Button>
                    
                    {userProfile?.image && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={handleImageRemove}
                        disabled={isImageUploading}
                      >
                        {isImageUploading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Removing...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove Image
                          </>
                        )}
                      </Button>
                    )}
                    
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isImageUploading}
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      JPG, PNG or GIF. Max 2MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input {...field} className="pl-10" placeholder="Enter your full name" />
                              </div>
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
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input {...field} type="email" className="pl-10" placeholder="Enter your email" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input {...field} className="pl-10" placeholder="Enter your phone number" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={profileForm.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input {...field} className="pl-10" placeholder="Enter your company name" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <Button type="submit" disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{hasPassword ? 'Change Password' : 'Set Password'}</CardTitle>
              <CardDescription>
                {hasPassword
                  ? 'Update your password to keep your account secure'
                  : 'Set a password to enable email/password login for your account'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* SET PASSWORD: Only show if !hasPassword and not passwordSuccess */}
              {!hasPassword && !passwordSuccess && (
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type={showNewPassword ? "text" : "password"}
                                  className="pl-10 pr-10"
                                  placeholder="Enter new password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
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
                              <div className="relative">
                                <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type={showConfirmPassword ? "text" : "password"}
                                  className="pl-10 pr-10"
                                  placeholder="Confirm new password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">
                        <Shield className="h-4 w-4 mr-2" />
                        Set Password
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
                             {/* Success message for set password */}
               {!hasPassword && passwordSuccess && (
                 <div className="text-center py-6">
                   <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                   <h3 className="text-lg font-semibold text-green-600 mb-2">Password Set Successfully!</h3>
                   <p className="text-muted-foreground mb-4">Your account is now secured with email/password login.</p>
                   <div className="text-sm text-muted-foreground">
                     Redirecting to dashboard...
                   </div>
                 </div>
               )}
              {/* CHANGE PASSWORD: Only show if hasPassword */}
              {hasPassword && (
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                className="pl-10 pr-10"
                                placeholder="Enter current password"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                onClick={() => setShowPassword(!showPassword)}
                              >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={passwordForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type={showNewPassword ? "text" : "password"}
                                  className="pl-10 pr-10"
                                  placeholder="Enter new password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
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
                              <div className="relative">
                                <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  {...field}
                                  type={showConfirmPassword ? "text" : "password"}
                                  className="pl-10 pr-10"
                                  placeholder="Confirm new password"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit">
                        <Shield className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                View your current subscription plan and status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {userProfile?.subscription ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Current Plan</Label>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {userProfile.subscription.plan}
                      </Badge>
                      <Badge 
                        variant={userProfile.subscription.status === 'active' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {userProfile.subscription.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(userProfile.subscription.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {userProfile.subscription.endDate && (
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(userProfile.subscription.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Account Status</Label>
                    <div className="flex items-center space-x-2">
                      {userProfile.isActive ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600">Active</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No subscription information available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 